const express = require('express');
const { getAllInventory, getInventoryById, getInventoryByUser, createInventory, updateInventory, deleteInventory, detectHardware } = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, getAllInventory);
router.get('/user/:userId', authenticate, getInventoryByUser);
router.get('/:id', authenticate, getInventoryById);
router.post('/', authenticate, createInventory);
router.put('/:id', authenticate, updateInventory);
router.delete('/:id', authenticate, authorize('Administrador'), deleteInventory);
router.get('/detect/hardware', authenticate, detectHardware);

module.exports = router;