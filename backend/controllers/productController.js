import { isAdmin } from "./userController.js";
import Product from "../models/product.js";
import Setting from "../models/setting.js";

export async function createProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({ message: "Access denied. Admins only" });
        return;
    }

    try {
        const existingProduct = await Product.findOne({
            productid: req.body.productid
        });
        if (existingProduct) {
            res.status(400).json({ message: "Product with given id already exists" });
            return;
        }

        const data = {}
        data.productid = req.body.productid;
        if (req.body.name == null) {
            res.status(400).json({ message: "Product name is required" });
            return;
        }
        data.name = req.body.name;

        data.description = req.body.description || "";
        data.altnames = req.body.altnames || [];
        if (req.body.price == null || req.body.price < 0) {
            res.status(400).json({ message: "A valid positive product price is required" });
            return;
        }
        data.price = req.body.price;

        if (req.body.stock != null && req.body.stock < 0) {
            res.status(400).json({ message: "Stock cannot be negative" });
            return;
        }
        data.stock = req.body.stock || 0;

        data.labelledprice = req.body.labelledprice || req.body.price;
        data.category = req.body.category || "other";
        data.image = req.body.image || ["/images/default.png", "/images/default.png"];
        data.isvisible = req.body.isvisible;
        data.brand = req.body.brand || "Generic";
        data.warranty = req.body.warranty || "No Warranty";
        data.model = req.body.model || "standard";

        const newProduct = new Product(data);
        await newProduct.save();
        res.status(201).json({ message: "Product created successfully", product: newProduct });

    } catch (error) {
        res.status(500).json({ message: "Error creating  product", error: error.message });
        return;
    }
}
export async function getProducts(req, res) {
    try {
        let query = {};

        // Visibility rules
        if (!isAdmin(req)) {
            query.isvisible = true; // Non-admins only see visible products
        }

        // 1. Filtering by category
        if (req.query.category) {
            query.category = req.query.category;
        }

        // 2. Filtering by brand
        if (req.query.brand) {
            query.brand = { $regex: new RegExp(req.query.brand, "i") }; // Case-insensitive
        }

        // 3. Search by name or description
        if (req.query.search) {
            query.$or = [
                { name: { $regex: new RegExp(req.query.search, "i") } },
                { description: { $regex: new RegExp(req.query.search, "i") } }
            ];
        }

        // 4. Filtering by Price Range
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

        // 5. Sorting
        let sortOption = {};
        if (req.query.sortBy === "priceAsc") {
            sortOption.price = 1;
        } else if (req.query.sortBy === "priceDesc") {
            sortOption.price = -1;
        }

        const products = await Product.find(query).sort(sortOption);
        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
}

export async function deleteProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({ message: "Access denied. Admins only" });
        return;
    }
    try {
        // Support both MongoDB _id and custom productid
        const product = await Product.findByIdAndDelete(req.params.productid)
            || await Product.findOneAndDelete({ productid: req.params.productid });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json({ message: "Product deleted successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
}
export async function updateProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({ message: "Access denied. Admins only" });
        return;
    }

    try {
        // Support both MongoDB _id and custom productid
        let product = await Product.findById(req.params.productid).catch(() => null)
            || await Product.findOne({ productid: req.params.productid });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        const data = {}
        if (req.body.name == null) {
            res.status(400).json({ message: "Product name is required" });
            return;
        }
        data.name = req.body.name;

        data.description = req.body.description || "";
        data.altnames = req.body.altnames || [];
        if (req.body.price == null || req.body.price < 0) {
            res.status(400).json({ message: "A valid positive product price is required" });
            return;
        }
        data.price = req.body.price;

        if (req.body.stock != null && req.body.stock < 0) {
            res.status(400).json({ message: "Stock cannot be negative" });
            return;
        }
        data.stock = req.body.stock ?? product.stock;

        data.labelledprice = req.body.labelledprice || req.body.price;

        await Product.findByIdAndUpdate(product._id, data);

        res.status(200).json({ message: "Product updated successfully", product: { ...product.toObject(), ...data } });

    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
}
export async function getProductById(req, res) {
    try {
        // Support both MongoDB _id and custom productid
        let product = await Product.findById(req.params.productid).catch(() => null)
            || await Product.findOne({ productid: req.params.productid });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        if (!product.isvisible && !isAdmin(req)) {
            res.status(403).json({ message: "Product is not available" });
            return;
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
}

export async function getLowStockProducts(req, res) {
    try {
        if (!isAdmin(req) && req.User?.role !== "inventoryManager") {
            return res.status(403).json({ message: "Access denied" });
        }

        // Get dynamic thresholds from settings
        const settings = await Setting.findOne({ key: "lowStockThresholds" });
        const limits = settings ? settings.value : {
            Laptop: 5, Desktop: 10, Monitor: 8, Accessories: 20, Other: 5
        };

        // Find products matching their specific category thresholds
        const lowStockProducts = await Product.find({
            $or: [
                { category: "Laptop", stock: { $lt: limits.Laptop } },
                { category: "Desktop", stock: { $lt: limits.Desktop } },
                { category: "Monitor", stock: { $lt: limits.Monitor } },
                { category: "Accessories", stock: { $lt: limits.Accessories } },
                { category: { $nin: ["Laptop", "Desktop", "Monitor", "Accessories"] }, stock: { $lt: limits.Other } }
            ]
        });

        res.status(200).json(lowStockProducts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching low stock products", error: error.message });
    }
}