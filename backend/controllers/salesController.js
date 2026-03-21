const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Create a new sale transaction
const createSale = async (req, res) => {
    // Start a Mongoose session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, discountPercent, taxPercent, subtotal, totalAmount } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No sale items provided' });
        }

        // 1. Verify stock and update product quantities
        for (const item of items) {
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                throw new Error(`Product not found: ${item.name}`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${item.name}. Available: ${product.stock}`);
            }

            // Decrease the stock quantity
            product.stock -= item.quantity;
            await product.save({ session });
        }

        // 2. Create the Sale record
        const sale = new Sale({
            user: req.user._id,
            items,
            discountPercent: discountPercent || 0,
            taxPercent: taxPercent || 0,
            subtotal,
            totalAmount
        });

        const createdSale = await sale.save({ session });

        // 3. Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json(createdSale);

    } catch (error) {
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();
        console.error('Error creating sale:', error);
        res.status(400).json({ message: error.message || 'Server error creating sale' });
    }
};

// Get all sales (For reporting)
const getSales = async (req, res) => {
    try {
        const sales = await Sale.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching sales' });
    }
};

module.exports = {
    createSale,
    getSales
};
