const express = require('express');
const { getAllCredentials, getCredentialById, createCredential, updateCredential, deleteCredential } = require('../controllers/credentialController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, authorize('Administrador'), getAllCredentials);
router.get('/:id', authenticate, authorize('Administrador'), getCredentialById);
router.post('/', authenticate, authorize('Administrador'), createCredential);
router.put('/:id', authenticate, authorize('Administrador'), updateCredential);
router.delete('/:id', authenticate, authorize('Administrador'), deleteCredential);

module.exports = router;