const express = require('express');
const router = express.Router();
const { getProducts, addProduct, updateProduct, deleteProduct, seedProducts } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Route to get all products (Protected)
router.get('/', protect, getProducts);

// Route to add a new product (Protected & Admin)
router.post('/', protect, admin, addProduct);

// Route to update a product (Protected & Admin)
router.put('/:id', protect, admin, updateProduct);

// Route to delete a product (Protected & Admin)
router.delete('/:id', protect, admin, deleteProduct);

// Route to seed initial data (Protected & Admin)
router.post('/seed', protect, admin, seedProducts);

module.exports = router;
