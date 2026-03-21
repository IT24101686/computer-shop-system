const Product = require('../models/Product');

// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching products' });
    }
};

// Add a single product
const addProduct = async (req, res) => {
    try {
        const { name, category, description, price, stock, warranty, specifications } = req.body;

        if (!name || !category || !price) {
            return res.status(400).json({ message: 'Please provide all required fields (name, category, price)' });
        }

        const product = await Product.create({
            name,
            category,
            description: description || '',
            price,
            stock: stock || 0,
            warranty: warranty || '1 Year',
            specifications: specifications || ''
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error adding product' });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating product' });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting product' });
    }
};

// Seed sample products
const seedProducts = async (req, res) => {
    try {
        // Clear existing products
        await Product.deleteMany({});

        const sampleProducts = [
            {
                name: 'Gaming Master Pro Desktop',
                category: 'Desktop',
                description: 'High-end gaming desktop with RTX 4080 and Intel i9',
                price: 2499.99,
                stock: 10,
                warranty: '3 Years',
                specifications: 'CPU: i9 13900K, RAM: 32GB DDR5, GPU: RTX 4080'
            },
            {
                name: 'UltraBook Slim 14',
                category: 'Laptop',
                description: 'Lightweight notebook perfect for professionals and students.',
                price: 1199.50,
                stock: 25,
                warranty: '2 Years',
                specifications: 'CPU: M2, RAM: 16GB, Storage: 512GB SSD'
            },
            {
                name: 'Mechanical Keyboard RGB',
                category: 'Accessory',
                description: 'Clicky blue switches with customizable RGB lighting',
                price: 89.99,
                stock: 50,
                warranty: '1 Year',
                specifications: 'Switches: Blue, Layout: Full Size'
            },
            {
                name: '27-inch 4K Monitor',
                category: 'Monitor',
                description: 'UHD resolution monitor with accurate color reproduction',
                price: 349.00,
                stock: 15,
                warranty: '3 Years',
                specifications: 'Resolution: 4K, Refresh Rate: 60Hz, Panel: IPS'
            }
        ];

        const createdProducts = await Product.insertMany(sampleProducts);
        res.status(201).json({ message: 'Products seeded successfully', products: createdProducts });
    } catch (error) {
        res.status(500).json({ message: 'Server Error seeding products' });
    }
};

module.exports = {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    seedProducts
};
