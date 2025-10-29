const express = require('express');
<<<<<<< HEAD
const { getAllInventory, getInventoryById, getInventoryByUser, createInventory, updateInventory, deleteInventory, detectHardware } = require('../controllers/inventoryController');
=======
const { getAllInventory, getInventoryById, createInventory, updateInventory, deleteInventory } = require('../controllers/inventoryController');
>>>>>>> 0d08f98e399ef9eae05c14c5081ac83d0bde67e7
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, getAllInventory);
<<<<<<< HEAD
router.get('/user/:userId', authenticate, getInventoryByUser);
=======
>>>>>>> 0d08f98e399ef9eae05c14c5081ac83d0bde67e7
router.get('/:id', authenticate, getInventoryById);
router.post('/', authenticate, createInventory);
router.put('/:id', authenticate, updateInventory);
router.delete('/:id', authenticate, authorize('Administrador'), deleteInventory);
<<<<<<< HEAD
router.get('/detect/hardware', authenticate, detectHardware);
=======
>>>>>>> 0d08f98e399ef9eae05c14c5081ac83d0bde67e7

module.exports = router;