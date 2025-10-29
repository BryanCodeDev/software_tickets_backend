const { Repository, User, History } = require('../models');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const getAllRepository = async (req, res) => {
  try {
    const files = await Repository.findAll({ include: User });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRepositoryById = async (req, res) => {
  try {
    const file = await Repository.findByPk(req.params.id, { include: User });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    const { name, category, tags } = req.body;
    const file = await Repository.create({ name, filePath: req.file.path, category, tags, uploadedBy: req.user.id });
    await History.create({ action: 'CREATE', tableName: 'Repositories', recordId: file.id, newValues: file.toJSON(), userId: req.user.id });
    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRepository = async (req, res) => {
  try {
    const file = await Repository.findByPk(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    const oldValues = file.toJSON();
    await file.update(req.body);
    await History.create({ action: 'UPDATE', tableName: 'Repositories', recordId: file.id, oldValues, newValues: file.toJSON(), userId: req.user.id });
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteRepository = async (req, res) => {
  try {
    const file = await Repository.findByPk(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    await History.create({ action: 'DELETE', tableName: 'Repositories', recordId: file.id, oldValues: file.toJSON(), userId: req.user.id });
    await file.destroy();
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllRepository, getRepositoryById, uploadFile, updateRepository, deleteRepository, upload };