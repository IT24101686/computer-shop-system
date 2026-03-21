const Order = require('../models/Order');

// Place a new order
const placeOrder = async (req, res) => {
    try {
        const { productItems, totalAmount, deliveryLocation } = req.body;

        if (!productItems || productItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        if (!deliveryLocation || !deliveryLocation.latitude || !deliveryLocation.longitude || !deliveryLocation.streetAddress) {
            return res.status(400).json({ message: 'Delivery location is required' });
        }

        // We can optionally check roles here, but the route should be protected
        if (req.user.role !== 'user' && req.user.role !== 'customer') {
            // In our schema 'user' is the default role, representing the 'Customer'
            // I'll allow 'user' to place orders.
        }

        const order = new Order({
            customerId: req.user._id,
            productItems,
            totalAmount,
            deliveryLocation,
            deliveryStatus: 'Processing', // default can be processing
            deliveryVehicleLocation: {
                latitude: deliveryLocation.latitude, // Initial placeholder
                longitude: deliveryLocation.longitude // Initial placeholder
            }
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);

    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Server error placing order' });
    }
};

// Get all orders (for staff/admin)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('customerId', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

// Get specific order details/tracking
const trackOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verification: Customers can only track their own orders. Staff can track any.
        const isStaff = ['admin', 'inventory_manager', 'sales_staff'].includes(req.user.role);
        if (order.customerId.toString() !== req.user._id.toString() && !isStaff) {
            return res.status(401).json({ message: 'Not authorized to view this order' });
        }

        res.json({
            _id: order._id,
            deliveryStatus: order.deliveryStatus,
            deliveryLocation: order.deliveryLocation,
            deliveryVehicleLocation: order.deliveryVehicleLocation,
            productItems: order.productItems,
            totalAmount: order.totalAmount
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error tracking order' });
    }
};

// Update order status and vehicle location (for delivery tracking simulation)
const updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryStatus, deliveryVehicleLocation } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (deliveryStatus) order.deliveryStatus = deliveryStatus;
        if (deliveryVehicleLocation) order.deliveryVehicleLocation = deliveryVehicleLocation;

        const updatedOrder = await order.save();

        // Emit real-time tracking update if there is a location change
        const io = req.app.get('io');
        if (io && deliveryVehicleLocation) {
            io.emit('orderLocationUpdate', {
                orderId: updatedOrder._id,
                deliveryVehicleLocation: updatedOrder.deliveryVehicleLocation,
                deliveryStatus: updatedOrder.deliveryStatus
            });
        }

        res.json(updatedOrder);

    } catch (error) {
        res.status(500).json({ message: 'Server error updating order status' });
    }
};

module.exports = {
    placeOrder,
    getAllOrders,
    trackOrder,
    updateDeliveryStatus
};
