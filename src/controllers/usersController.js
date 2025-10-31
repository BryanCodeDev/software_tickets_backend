const { User, Role, UserSetting } = require('../models');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: Role });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Get assigned inventory
    const { Inventory } = require('../models');
    const assignedInventory = await Inventory.findAll({
      where: { assignedTo: req.user.id },
      attributes: ['id', 'it', 'propiedad', 'area', 'responsable', 'serial', 'capacidad', 'ram', 'marca', 'status', 'location']
    });
    res.json({
      id: user.id,
      name: user.name || user.username,
      email: user.email,
      username: user.username,
      it: user.it,
      role: user.Role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      assignedInventory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, username, it } = req.body;
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

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      username: username || user.username,
      it: it !== undefined ? it : user.it
    });

    const updatedUser = await User.findByPk(req.user.id, { include: Role });
    // Get assigned inventory
    const { Inventory } = require('../models');
    const assignedInventory = await Inventory.findAll({
      where: { assignedTo: req.user.id },
      attributes: ['id', 'it', 'propiedad', 'area', 'responsable', 'serial', 'capacidad', 'ram', 'marca', 'status', 'location']
    });
    res.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: updatedUser.id,
        name: updatedUser.name || updatedUser.username,
        email: updatedUser.email,
        username: updatedUser.username,
        it: updatedUser.it,
        role: updatedUser.Role,
        isActive: updatedUser.isActive,
        assignedInventory
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
    const { roleId, it } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.update({
      roleId: roleId || user.roleId,
      it: it !== undefined ? it : user.it
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

const enable2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `DuvyClass (${user.email})`,
      issuer: 'DuvyClass'
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Store secret temporarily (not enabled yet)
    await user.update({
      twoFactorSecret: secret.base32
    });

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: 'Configuración 2FA no encontrada' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time windows (30 seconds each)
    });

    if (!verified) {
      return res.status(400).json({ error: 'Código de verificación incorrecto' });
    }

    // Enable 2FA
    await user.update({
      twoFactorEnabled: true
    });

    res.json({ message: 'Autenticación de dos factores habilitada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const disable2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.update({
      twoFactorEnabled: false,
      twoFactorSecret: null
    });

    res.json({ message: 'Autenticación de dos factores deshabilitada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const get2FAStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      enabled: user.twoFactorEnabled || false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiration (1 hour from now)
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.update({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: resetExpires
    });

    // Send email (for now, just return the token - in production, send email)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Create transporter (configure with your email service)
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Restablecimiento de Contraseña - DuvyClass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Restablecimiento de Contraseña</h2>
          <p>Hola ${user.name || user.username},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
          <a href="${resetUrl}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Restablecer Contraseña</a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, ignora este mensaje.</p>
          <p>Saludos,<br>Equipo de DuvyClass</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico' });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // For development, return the token directly
      res.json({
        message: 'Para desarrollo: usa este token para restablecer la contraseña',
        resetToken: resetToken,
        resetUrl: resetUrl
      });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.json({ message: 'Contraseña restablecida exitosamente' });
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
  updateSettings,
  enable2FA,
  verify2FA,
  disable2FA,
  get2FAStatus,
  requestPasswordReset,
  resetPassword
};