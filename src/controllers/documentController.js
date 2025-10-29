const { Document, User, History } = require('../models');
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

const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({ include: User });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, { include: User });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const { title, description, type, category, expiryDate } = req.body;
    const document = await Document.create({ title, description, filePath: req.file.path, type, category, expiryDate, createdBy: req.user.id });
    await History.create({ action: 'CREATE', tableName: 'Documents', recordId: document.id, newValues: document.toJSON(), userId: req.user.id });
    res.status(201).json(document);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const oldValues = document.toJSON();
    await document.update(req.body);
    await History.create({ action: 'UPDATE', tableName: 'Documents', recordId: document.id, oldValues, newValues: document.toJSON(), userId: req.user.id });
    res.json(document);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    await History.create({ action: 'DELETE', tableName: 'Documents', recordId: document.id, oldValues: document.toJSON(), userId: req.user.id });
    await document.destroy();
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllDocuments, getDocumentById, uploadDocument, updateDocument, deleteDocument, upload };