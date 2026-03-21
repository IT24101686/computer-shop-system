const Supplier = require('../models/Supplier');

// Get all suppliers
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({});
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching suppliers' });
    }
};

// Get a single supplier by ID
const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.json({
            name: supplier.name,
            phone: supplier.phoneNumber || supplier.phone,
            currentLocation: supplier.currentLocation
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching supplier' });
    }
};

// Add a single supplier
const addSupplier = async (req, res) => {
    try {
        const { name, contactPerson, email, phone, status, phoneNumber, currentLocation } = req.body;

        if (!name || !contactPerson || !email || !phone) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const supplierExists = await Supplier.findOne({ email });
        if (supplierExists) {
            return res.status(400).json({ message: 'Supplier with that email already exists' });
        }

        const supplier = await Supplier.create({
            name,
            contactPerson,
            email,
            phone,
            phoneNumber: phoneNumber || phone,
            status: status || 'Active',
            currentLocation: currentLocation || { lat: 0, lng: 0 }
        });

        res.status(201).json(supplier);
    } catch (error) {
        res.status(500).json({ message: 'Server error adding supplier' });
    }
};

// Update a supplier
const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        const updatedSupplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedSupplier);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating supplier' });
    }
};

// Update a supplier location
const updateSupplierLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;

        if (lat === undefined || lng === undefined) {
            return res.status(400).json({ message: 'Latitude and Longitude are required' });
        }

        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        supplier.currentLocation = { lat, lng };
        const updatedSupplier = await supplier.save();

        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('locationUpdate', {
                supplierId: updatedSupplier._id,
                currentLocation: updatedSupplier.currentLocation
            });
        }

        res.json(updatedSupplier);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating location' });
    }
};

// Delete a supplier
const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        await Supplier.findByIdAndDelete(req.params.id);

        res.json({ message: 'Supplier removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting supplier' });
    }
};

module.exports = {
    getSuppliers,
    getSupplierById,
    addSupplier,
    updateSupplier,
    updateSupplierLocation,
    deleteSupplier
};
