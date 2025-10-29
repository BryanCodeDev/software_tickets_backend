const express = require('express');
const { getAllRepository, getRepositoryById, uploadFile, updateRepository, deleteRepository, upload } = require('../controllers/repositoryController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, getAllRepository);
router.get('/:id', authenticate, getRepositoryById);
router.post('/', authenticate, upload.single('file'), uploadFile);
router.put('/:id', authenticate, authorize('Administrador'), updateRepository);
router.delete('/:id', authenticate, authorize('Administrador'), deleteRepository);

module.exports = router;