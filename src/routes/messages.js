const express = require('express');
const { getMessages, createMessage, updateMessage, deleteMessage } = require('../controllers/messageController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener mensajes de un ticket
router.get('/ticket/:ticketId', getMessages);

// Crear mensaje en un ticket
router.post('/ticket/:ticketId', createMessage);

// Actualizar mensaje
router.put('/:id', updateMessage);

// Eliminar mensaje
router.delete('/:id', deleteMessage);

module.exports = router;