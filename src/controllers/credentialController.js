const { Credential, User, History } = require('../models');

const getAllCredentials = async (req, res) => {
  try {
    const userRole = req.user.Role.name;

    // Only administrators can access credentials
    if (userRole !== 'Administrador') {
      return res.status(403).json({ error: 'No tienes permisos para acceder a las credenciales' });
    }

    const credentials = await Credential.findAll({ include: [{ model: User, as: 'creator' }, { model: User, as: 'updater' }] });
    res.json(credentials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCredentialById = async (req, res) => {
  try {
    const userRole = req.user.Role.name;

    // Only administrators can access credentials
    if (userRole !== 'Administrador') {
      return res.status(403).json({ error: 'No tienes permisos para acceder a las credenciales' });
    }

    const credential = await Credential.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator' },
        { model: User, as: 'updater' }
      ]
    });
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }
    res.json(credential);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createCredential = async (req, res) => {
  try {
    const userRole = req.user.Role.name;

    // Only administrators can create credentials
    if (userRole !== 'Administrador') {
      return res.status(403).json({ error: 'No tienes permisos para crear credenciales' });
    }

    const credential = await Credential.create({ ...req.body, createdBy: req.user.id });
    await History.create({ action: 'CREATE', tableName: 'Credentials', recordId: credential.id, newValues: credential.toJSON(), userId: req.user.id });

    // Return credential with user associations
    const credentialWithUser = await Credential.findByPk(credential.id, {
      include: [
        { model: User, as: 'creator' },
        { model: User, as: 'updater' }
      ]
    });
    res.status(201).json(credentialWithUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCredential = async (req, res) => {
  try {
    const userRole = req.user.Role.name;

    // Only administrators can update credentials
    if (userRole !== 'Administrador') {
      return res.status(403).json({ error: 'No tienes permisos para actualizar credenciales' });
    }

    const credential = await Credential.findByPk(req.params.id);
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }
    const oldValues = credential.toJSON();
    await credential.update({ ...req.body, updatedBy: req.user.id });
    await History.create({ action: 'UPDATE', tableName: 'Credentials', recordId: credential.id, oldValues, newValues: credential.toJSON(), userId: req.user.id });

    // Return credential with user associations
    const updatedCredential = await Credential.findByPk(credential.id, {
      include: [
        { model: User, as: 'creator' },
        { model: User, as: 'updater' }
      ]
    });
    res.json(updatedCredential);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCredential = async (req, res) => {
  try {
    const userRole = req.user.Role.name;

    // Only administrators can delete credentials
    if (userRole !== 'Administrador') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar credenciales' });
    }

    const credential = await Credential.findByPk(req.params.id);
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }
    await History.create({ action: 'DELETE', tableName: 'Credentials', recordId: credential.id, oldValues: credential.toJSON(), userId: req.user.id });
    await credential.destroy();
    res.json({ message: 'Credential deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllCredentials, getCredentialById, createCredential, updateCredential, deleteCredential };