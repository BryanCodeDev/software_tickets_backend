const { Message, Ticket, User, History } = require('../models');
const { emitNewMessage, emitMessageUpdated, emitMessageDeleted } = require('../socket');

const getMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Verificar que el ticket existe y el usuario tiene acceso
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const userRole = req.user.Role.name;
    const isOwner = ticket.userId === req.user.id;
    const isAssigned = ticket.assignedTo === req.user.id;

    // Verificar permisos de acceso
    if (userRole === 'Administrador') {
      // Admin puede ver todos los mensajes
    } else if (userRole === 'Técnico') {
      // Técnicos pueden ver mensajes de tickets que crearon o les asignaron
      if (!isOwner && !isAssigned) {
        return res.status(403).json({ error: 'No tienes permisos para ver los mensajes de este ticket' });
      }
    } else if (userRole === 'Empleado') {
      // Empleados solo pueden ver mensajes de sus propios tickets
      if (!isOwner) {
        return res.status(403).json({ error: 'Solo puedes ver mensajes de tus propios tickets' });
      }
    }

    const messages = await Message.findAll({
      where: { ticketId },
      include: [{ model: User, as: 'sender' }],
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createMessage = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'El contenido del mensaje es requerido' });
    }

    // Verificar que el ticket existe
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const userRole = req.user.Role.name;
    const isOwner = ticket.userId === req.user.id;
    const isAssigned = ticket.assignedTo === req.user.id;

    // Verificar permisos para enviar mensajes
    if (userRole === 'Administrador') {
      // Admin puede enviar mensajes a cualquier ticket
    } else if (userRole === 'Técnico') {
      // Técnicos pueden enviar mensajes a tickets que crearon o les asignaron
      if (!isOwner && !isAssigned) {
        return res.status(403).json({ error: 'No tienes permisos para enviar mensajes a este ticket' });
      }
    } else if (userRole === 'Empleado') {
      // Empleados solo pueden enviar mensajes a sus propios tickets
      if (!isOwner) {
        return res.status(403).json({ error: 'Solo puedes enviar mensajes a tus propios tickets' });
      }
    }

    const message = await Message.create({
      content: content.trim(),
      ticketId,
      userId: req.user.id
    });

    // Crear registro en el historial
    await History.create({
      action: 'CREATE',
      tableName: 'Messages',
      recordId: message.id,
      newValues: message.toJSON(),
      userId: req.user.id
    });

    // Obtener el mensaje con información del usuario
    const messageWithUser = await Message.findByPk(message.id, {
      include: [{ model: User, as: 'sender' }]
    });

    // Emitir evento de nuevo mensaje
    emitNewMessage(ticketId, messageWithUser);

    res.status(201).json(messageWithUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'El contenido del mensaje es requerido' });
    }

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    // Solo el autor del mensaje puede editarlo
    if (message.userId !== req.user.id) {
      return res.status(403).json({ error: 'Solo puedes editar tus propios mensajes' });
    }

    const oldValues = message.toJSON();

    await message.update({
      content: content.trim(),
      isEdited: true,
      editedAt: new Date()
    });

    // Crear registro en el historial
    await History.create({
      action: 'UPDATE',
      tableName: 'Messages',
      recordId: message.id,
      oldValues,
      newValues: message.toJSON(),
      userId: req.user.id
    });

    // Obtener el mensaje actualizado con información del usuario
    const updatedMessage = await Message.findByPk(id, {
      include: [{ model: User, as: 'sender' }]
    });

    // Emitir evento de mensaje actualizado
    emitMessageUpdated(message.ticketId, updatedMessage);

    res.json(updatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    const userRole = req.user.Role.name;
    const isMessageOwner = message.userId === req.user.id;

    // Verificar permisos para eliminar
    if (userRole === 'Administrador') {
      // Admin puede eliminar cualquier mensaje
    } else if (isMessageOwner) {
      // El autor puede eliminar su propio mensaje
    } else {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este mensaje' });
    }

    const ticketId = message.ticketId;

    // Crear registro en el historial antes de eliminar
    await History.create({
      action: 'DELETE',
      tableName: 'Messages',
      recordId: message.id,
      oldValues: message.toJSON(),
      userId: req.user.id
    });

    await message.destroy();

    // Emitir evento de mensaje eliminado
    emitMessageDeleted(ticketId, id);

    res.json({ message: 'Mensaje eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMessages, createMessage, updateMessage, deleteMessage };