const { User, Role, UserSetting } = require('../models');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: Role });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
<<<<<<< HEAD
    // Get assigned inventory
    const { Inventory } = require('../models');
    const assignedInventory = await Inventory.findAll({
      where: { assignedTo: req.user.id },
      attributes: ['id', 'it', 'propiedad', 'area', 'responsable', 'serial', 'capacidad', 'ram', 'marca', 'status', 'location']
    });
=======
>>>>>>> 0d08f98e399ef9eae05c14c5081ac83d0bde67e7
    res.json({
      id: user.id,
      name: user.name || user.username,
      email: user.email,
      phone: user.phone,
      department: user.department,
<<<<<<< HEAD
      it: user.it,
      role: user.Role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      assignedInventory
=======
      role: user.Role,
      isActive: user.isActive,
      createdAt: user.createdAt
>>>>>>> 0d08f98e399ef9eae05c14c5081ac83d0bde67e7
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, department } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      department: department || user.department
    });

    const updatedUser = await User.findByPk(req.user.id, { include: Role });
<<<<<<< HEAD
    // Get assigned inventory
    const { Inventory } = require('../models');
    const assignedInventory = await Inventory.findAll({
      where: { assignedTo: req.user.id },
      attributes: ['id', 'it', 'propiedad', 'area', 'responsable', 'serial', 'capacidad', 'ram', 'marca', 'status', 'location']
    });
=======
>>>>>>> 0d08f98e399ef9eae05c14c5081ac83d0bde67e7
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: updatedUser.id,
        name: updatedUser.name || updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        department: updatedUser.department,
<<<<<<< HEAD
        it: updatedUser.it,
        role: updatedUser.Role,
        isActive: updatedUser.isActive,
        assignedInventory
=======
        role: updatedUser.Role,
        isActive: updatedUser.isActive
>>>>>>> 0d08f98e399ef9eae05c14c5081ac83d0bde67e7
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await user.update({ password: hashedPassword });
    res.json({ message: 'Contraseña cambiada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: Role,
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: Role,
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const { roleId, it } = req.body;
=======
    const { name, email, phone, department, roleId, isActive } = req.body;
>>>>>>> 0d08f98e399ef9eae05c14c5081ac83d0bde67e7
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

<<<<<<< HEAD
    await user.update({
      roleId: roleId || user.roleId,
      it: it !== undefined ? it : user.it
=======
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      department: department || user.department,
      roleId: roleId || user.roleId,
      isActive: isActive !== undefined ? isActive : user.isActive
>>>>>>> 0d08f98e399ef9eae05c14c5081ac83d0bde67e7
    });

    const updatedUser = await User.findByPk(id, { include: Role });
    res.json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Check if user has related records that prevent deletion
    const relatedRecords = await Promise.all([
      require('../models').Credential.count({ where: { createdBy: id } }),
      require('../models').Credential.count({ where: { updatedBy: id } }),
      require('../models').Ticket.count({ where: { userId: id } }),
      require('../models').Ticket.count({ where: { assignedTo: id } }),
      require('../models').Comment.count({ where: { userId: id } }),
      require('../models').Message.count({ where: { userId: id } }),
      require('../models').Document.count({ where: { createdBy: id } }),
      require('../models').Repository.count({ where: { uploadedBy: id } }),
      require('../models').History.count({ where: { userId: id } }),
      require('../models').TicketAttachment.count({ where: { uploadedBy: id } })
    ]);

    const hasRelatedRecords = relatedRecords.some(count => count > 0);

    if (hasRelatedRecords) {
      return res.status(400).json({
        error: 'No se puede eliminar el usuario porque tiene registros relacionados. Desactívelo en su lugar.'
      });
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSettings = async (req, res) => {
  try {
    let settings = await UserSetting.findOne({ where: { userId: req.user.id } });
    if (!settings) {
      // Create default settings if they don't exist
      settings = await UserSetting.create({ userId: req.user.id });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { notifications, emailAlerts, darkMode, language } = req.body;

    let settings = await UserSetting.findOne({ where: { userId: req.user.id } });
    if (!settings) {
      settings = await UserSetting.create({
        userId: req.user.id,
        notifications: notifications !== undefined ? notifications : true,
        emailAlerts: emailAlerts !== undefined ? emailAlerts : true,
        darkMode: darkMode !== undefined ? darkMode : false,
        language: language || 'es'
      });
    } else {
      await settings.update({
        notifications: notifications !== undefined ? notifications : settings.notifications,
        emailAlerts: emailAlerts !== undefined ? emailAlerts : settings.emailAlerts,
        darkMode: darkMode !== undefined ? darkMode : settings.darkMode,
        language: language || settings.language
      });
    }

    res.json({ message: 'Configuración guardada exitosamente', settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getSettings,
  updateSettings
};