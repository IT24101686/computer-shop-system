const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
});

const deliveryLocationSchema = new mongoose.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    streetAddress: { type: String, required: true }
});

const deliveryVehicleLocationSchema = new mongoose.Schema({
    latitude: { type: Number },
    longitude: { type: Number }
});

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productItems: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    deliveryStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Out for Delivery', 'Delivered'],
        default: 'Pending'
    },
    deliveryLocation: deliveryLocationSchema,
    deliveryVehicleLocation: deliveryVehicleLocationSchema
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
