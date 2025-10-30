const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser, getProfile, updateProfile, changePassword, getSettings, updateSettings } = require('../controllers/usersController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Profile routes (accessible by authenticated users)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

// Settings routes
router.get('/settings', authenticate, getSettings);
router.put('/settings', authenticate, updateSettings);

// Admin routes (only for administrators and technicians)
router.get('/', authenticate, authorize('Administrador', 'Técnico'), getAllUsers);
router.get('/:id', authenticate, authorize('Administrador'), getUserById);
router.put('/:id', authenticate, authorize('Administrador'), updateUser);
router.delete('/:id', authenticate, authorize('Administrador'), deleteUser);

module.exports = router;