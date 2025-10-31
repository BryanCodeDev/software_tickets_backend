const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const { User, Role } = require('../models');

const register = async (req, res) => {
  console.log('Register request received:', { username: req.body.username, email: req.body.email, roleId: req.body.roleId || 3 });
  try {
    const { username, name, email, password, roleId = 3, it } = req.body; // Default to 'Empleado' role
    console.log('Using roleId:', roleId);
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    const user = await User.create({ username, name, email, password, roleId, it });
    console.log('User created with roleId:', user.roleId);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Registration successful, sending response');
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.Role, name: user.name, it: user.it }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;
    console.log('Login attempt for:', email);

    const user = await User.findOne({ where: { email }, include: Role });
    console.log('User found:', !!user);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      console.log('2FA is enabled for user');
      if (!twoFactorToken) {
        return res.status(206).json({
          requires2FA: true,
          message: 'Se requiere código de autenticación de dos factores'
        });
      }

      // Verify 2FA token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 2
      });

      console.log('2FA token verified:', verified);

      if (!verified) {
        return res.status(401).json({ error: 'Código de autenticación de dos factores incorrecto' });
      }
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    console.log('Login successful, sending token');

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.Role,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ include: Role });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { include: Role });
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
    const { username, email, roleId } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    await user.update({ username, email, roleId });
    res.json({ message: 'Usuario actualizado exitosamente', user });
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
    await user.destroy();
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getAllUsers, getUserById, updateUser, deleteUser };