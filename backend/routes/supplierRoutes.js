const express = require('express');
const router = express.Router();
const { getSuppliers, getSupplierById, addSupplier, updateSupplier, updateSupplierLocation, deleteSupplier } = require('../controllers/supplierController');
const { protect, admin, inventoryManager } = require('../middleware/authMiddleware');

// Route to get all suppliers (Protected)
router.get('/', protect, getSuppliers);

// Route to get a supplier by ID (Protected & Inventory Manager)
router.get('/:id', protect, inventoryManager, getSupplierById);

// Route to add a new supplier (Protected & Admin)
router.post('/', protect, admin, addSupplier);

// Route to update a supplier (Protected & Admin)
router.put('/:id', protect, admin, updateSupplier);

// Route to update a supplier location (Protected & Inventory Manager)
router.put('/:id/location', protect, inventoryManager, updateSupplierLocation);

// Route to delete a supplier (Protected & Admin)
router.delete('/:id', protect, admin, deleteSupplier);

module.exports = router;
