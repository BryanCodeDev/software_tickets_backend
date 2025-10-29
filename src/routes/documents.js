const express = require('express');
const { getAllDocuments, getDocumentById, uploadDocument, updateDocument, deleteDocument, upload } = require('../controllers/documentController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, getAllDocuments);
router.get('/:id', authenticate, getDocumentById);
router.post('/', authenticate, upload.single('file'), uploadDocument);
router.put('/:id', authenticate, authorize('Administrador'), updateDocument);
router.delete('/:id', authenticate, authorize('Administrador'), deleteDocument);

module.exports = router;