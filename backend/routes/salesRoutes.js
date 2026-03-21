const express = require('express');
const router = express.Router();
const { createSale, getSales } = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');

// Route to get all sales (Protected)
router.get('/', protect, getSales);

// Route to create a new sale (Protected)
router.post('/', protect, createSale);

module.exports = router;
