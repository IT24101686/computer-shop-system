const express = require('express');
const router = express.Router();
const { placeOrder, getAllOrders, trackOrder, updateDeliveryStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all orders (Protected & Admin or Inventory/Sales Staff - assuming we add check in controller, simplest is protect + admin for now)
router.get('/', protect, admin, getAllOrders);

// POST place order (Protected)
router.post('/', protect, placeOrder);

// GET track order by ID (Protected)
router.get('/:id/track', protect, trackOrder);

// PUT update order delivery (Protected & Admin - simulating vehicle tracking)
router.put('/:id/tracking', protect, admin, updateDeliveryStatus);

module.exports = router;
