const { Ticket, User, Comment, Message, History, TicketAttachment } = require('../models');
const { emitNewComment, emitTicketUpdate } = require('../socket');

const getAllTickets = async (req, res) => {
  try {
    // All users can see all tickets regardless of role
    const whereClause = {};

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator' },
        { model: User, as: 'assignee' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(tickets);
  } catch (err) {
    console.error('Error getting all tickets:', err);
    res.status(500).json({ error: err.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator'
        },
        {
          model: User,
          as: 'assignee'
        },
        {
          model: Comment,
          include: [{
            model: User,
            as: 'user'
          }]
        },
        {
          model: Message,
          include: [{
            model: User,
            as: 'sender'
          }]
        },
        {
          model: TicketAttachment,
          include: [{
            model: User,
            as: 'uploader'
          }]
        }
      ]
    });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Debug logging
    console.log('Ticket found:', ticket.id);
    console.log('Ticket attachments:', ticket.TicketAttachments);
    console.log('Attachments count:', ticket.TicketAttachments ? ticket.TicketAttachments.length : 0);

    res.json(ticket);
  } catch (err) {
    console.error('Error in getTicketById:', err);
    res.status(500).json({ error: err.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;

    // Set default category if not provided
    const category = req.body.category || 'General';

    // Set default status if not provided
    const ticketStatus = status || 'abierto';

    // All authenticated users can create tickets
    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      status: ticketStatus,
      userId: req.user.id
    });

    await History.create({
      action: 'CREATE',
      tableName: 'Tickets',
      recordId: ticket.id,
      newValues: ticket.toJSON(),
      userId: req.user.id
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const userRole = req.user.Role.name;
    const isOwner = ticket.userId === req.user.id;
    const isAssigned = ticket.assignedTo === req.user.id;

    // Role-based permissions for editing
    if (userRole === 'Administrador') {
      // Admin can edit everything
    } else if (userRole === 'Técnico') {
      // Technicians can edit status, priority, and assignment
      const allowedFields = ['status', 'priority', 'assignedTo'];
      const updateData = {};

      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = req.body[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(403).json({ error: 'No tienes permisos para editar estos campos' });
      }

      req.body = updateData;
    } else if (isOwner && userRole === 'Empleado') {
      // Employees can only edit their own tickets (title, description, priority)
      const allowedFields = ['title', 'description', 'priority'];
      const updateData = {};

      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = req.body[key];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(403).json({ error: 'No tienes permisos para editar estos campos' });
      }

      req.body = updateData;
    } else {
      return res.status(403).json({ error: 'No tienes permisos para editar este ticket' });
    }

    const oldValues = ticket.toJSON();

    // Handle empty string for assignedTo - convert to null
    if (req.body.assignedTo === '') {
      req.body.assignedTo = null;
    }

    await ticket.update(req.body);
    await History.create({
      action: 'UPDATE',
      tableName: 'Tickets',
      recordId: ticket.id,
      oldValues,
      newValues: ticket.toJSON(),
      userId: req.user.id
    });
    // Emit ticket update event to all users in the ticket room
    emitTicketUpdate(ticket.id, ticket);

    res.json(ticket);
  } catch (err) {
    console.error('Error updating ticket:', err);
    res.status(500).json({ error: err.message });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const userRole = req.user.Role.name;
    const isOwner = ticket.userId === req.user.id;
    const isAssigned = ticket.assignedTo === req.user.id;

    // Role-based permissions for deletion
    if (userRole === 'Administrador') {
      // Admin can delete any ticket
    } else if (userRole === 'Técnico') {
      // Technicians can delete tickets they created or are assigned to if closed
      if (!isOwner && !isAssigned) {
        return res.status(403).json({ error: 'Solo puedes eliminar tickets que creaste o que te están asignados' });
      }
      if (ticket.status !== 'cerrado') {
        return res.status(403).json({ error: 'Solo puedes eliminar tickets que estén cerrados' });
      }
    } else if (userRole === 'Empleado') {
      // Employees can only delete their own tickets if closed
      if (!isOwner) {
        return res.status(403).json({ error: 'Solo puedes eliminar tus propios tickets' });
      }
      if (ticket.status !== 'cerrado') {
        return res.status(403).json({ error: 'Solo puedes eliminar tickets que estén cerrados' });
      }
    }

    // Delete related records and files
    const fs = require('fs').promises;
    const path = require('path');

    // Delete comments
    await Comment.destroy({ where: { ticketId: req.params.id } });

    // Delete messages
    await Message.destroy({ where: { ticketId: req.params.id } });

    // Delete attachments and their files
    const attachments = await TicketAttachment.findAll({ where: { ticketId: req.params.id } });
    for (const attachment of attachments) {
      try {
        // Delete physical file
        const filePath = path.join(__dirname, '../../uploads/tickets', path.basename(attachment.path));
        await fs.unlink(filePath);
      } catch (fileErr) {
        console.warn('Could not delete file:', attachment.path, fileErr.message);
      }
    }
    await TicketAttachment.destroy({ where: { ticketId: req.params.id } });

    // Create history record
    await History.create({
      action: 'DELETE',
      tableName: 'Tickets',
      recordId: ticket.id,
      oldValues: ticket.toJSON(),
      userId: req.user.id
    });

    // Delete the ticket
    await ticket.destroy();
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error('Error deleting ticket:', err);
    res.status(500).json({ error: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const userRole = req.user.Role.name;
    const isOwner = ticket.userId === req.user.id;
    const isAssigned = ticket.assignedTo === req.user.id;

    // Role-based permissions for commenting
    if (userRole === 'Administrador') {
      // Admins can comment on any ticket
    } else if (userRole === 'Técnico') {
      // Technicians can comment on tickets they created or are assigned to
      if (!isOwner && !isAssigned) {
        return res.status(403).json({ error: 'Solo puedes comentar en tickets que creaste o que te están asignados' });
      }
    } else if (userRole === 'Empleado') {
      // Employees can only comment on their own tickets
      if (!isOwner) {
        return res.status(403).json({ error: 'Solo puedes comentar en tus propios tickets' });
      }
    }

    const comment = await Comment.create({ content, ticketId: req.params.id, userId: req.user.id });
    // Return comment with user information
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user' }]
    });

    // Emit new comment event to all users in the ticket room
    emitNewComment(req.params.id, commentWithUser);

    res.status(201).json(commentWithUser);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: err.message });
  }
};

const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const userRole = req.user.Role.name;
    const isOwner = ticket.userId === req.user.id;
    const isAssigned = ticket.assignedTo === req.user.id;

    // Role-based permissions for uploading attachments
    if (userRole === 'Administrador') {
      // Admins can upload to any ticket
    } else if (userRole === 'Técnico') {
      // Technicians can upload to tickets they created or are assigned to
      if (!isOwner && !isAssigned) {
        return res.status(403).json({ error: 'Solo puedes subir archivos a tickets que creaste o que te están asignados' });
      }
    } else if (userRole === 'Empleado') {
      // Employees can only upload to their own tickets
      if (!isOwner) {
        return res.status(403).json({ error: 'Solo puedes subir archivos a tus propios tickets' });
      }
    }

    const attachment = await TicketAttachment.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      path: req.file.path.replace(/\\/g, '/'), // Normalize path for cross-platform compatibility
      ticketId: req.params.id,
      uploadedBy: req.user.id
    });

    // Return attachment with uploader information
    const attachmentWithUser = await TicketAttachment.findByPk(attachment.id, {
      include: [{ model: User, as: 'uploader' }]
    });

    res.status(201).json(attachmentWithUser);
  } catch (err) {
    console.error('Error uploading attachment:', err);
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Datos de archivo inválidos' });
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Referencia inválida al ticket o usuario' });
    }
    res.status(500).json({ error: 'Error interno del servidor al subir el archivo' });
  }
};

const searchTickets = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const userRole = req.user.Role.name;
    let whereClause = {};

    // Base search conditions
    const searchConditions = {
      [require('sequelize').Op.or]: [
        { title: { [require('sequelize').Op.like]: `%${q}%` } },
        { description: { [require('sequelize').Op.like]: `%${q}%` } },
        { category: { [require('sequelize').Op.like]: `%${q}%` } }
      ]
    };

    // Apply role-based filtering
    if (userRole === 'Administrador') {
      whereClause = searchConditions;
    } else if (userRole === 'Técnico') {
      // Technicians can see all tickets for search
      whereClause = searchConditions;
    } else if (userRole === 'Empleado') {
      // Employees can search all tickets but results will be filtered on frontend
      whereClause = searchConditions;
    }

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator' },
        { model: User, as: 'assignee' }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(tickets);
  } catch (err) {
    console.error('Error searching tickets:', err);
    res.status(500).json({ error: err.message });
  }
};

const generateTicketsReport = async (req, res) => {
  try {
    // All users can see all tickets for reports
    const whereClause = {};

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator' },
        { model: User, as: 'assignee' }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Generate CSV content
    let csvContent = 'ID,Título,Descripción,Categoría,Prioridad,Estado,Creado por,Asignado a,Fecha de creación,Última actualización\n';

    tickets.forEach(ticket => {
      const row = [
        ticket.id,
        `"${(ticket.title || '').replace(/"/g, '""')}"`,
        `"${(ticket.description || '').replace(/"/g, '""')}"`,
        ticket.category || '',
        ticket.priority || '',
        ticket.status || '',
        ticket.creator ? (ticket.creator.name || ticket.creator.username) : '',
        ticket.assignee ? (ticket.assignee.name || ticket.assignee.username) : '',
        ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('es-ES') : '',
        ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString('es-ES') : ''
      ];
      csvContent += row.join(',') + '\n';
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_tickets_${new Date().toISOString().split('T')[0]}.csv`);

    // Add BOM for proper UTF-8 encoding in Excel
    res.write('\uFEFF');
    res.end(csvContent);
  } catch (err) {
    console.error('Error generating tickets report:', err);
    res.status(500).json({ error: err.message });
  }
};

const getTicketStats = async (req, res) => {
  try {
    // All users can see all ticket stats
    const whereClause = {};

    const stats = await Ticket.findAll({
      where: whereClause,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status']
    });

    // Convert to object format
    const ticketStats = {};
    stats.forEach(stat => {
      ticketStats[stat.dataValues.status] = parseInt(stat.dataValues.count);
    });

    res.json(ticketStats);
  } catch (err) {
    console.error('Error getting ticket stats:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllTickets, getTicketById, createTicket, updateTicket, deleteTicket, addComment, uploadAttachment, searchTickets, generateTicketsReport, getTicketStats };
