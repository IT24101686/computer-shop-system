import Review from "../models/review.js";
import Product from "../models/product.js";

// Add a new review
export async function addReview(req, res) {
    try {
        const { productId, rating, comment } = req.body;

        // Ensure user is logged in
        if (!req.User || !req.User.email) {
            return res.status(401).json({ message: "Please login to add a review" });
        }

        // Check if product exists
        const product = await Product.findOne({ productid: productId });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Optional: Check if the user already reviewed this product
        const existingReview = await Review.findOne({
            productId: productId,
            userEmail: req.User.email
        });

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        // Create new review
        const newReview = new Review({
            productId,
            userEmail: req.User.email,
            userName: req.User.firstName + " " + (req.User.lastName || ""),
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json({ message: "Review added successfully", review: newReview });

    } catch (error) {
        res.status(500).json({ message: "Error adding review", error: error.message });
    }
}

// Get all reviews for a specific product
export async function getProductReviews(req, res) {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

        // Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = (sum / reviews.length).toFixed(1);
        }

        res.status(200).json({
            totalReviews: reviews.length,
            averageRating: Number(averageRating),
            reviews
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews", error: error.message });
    }
}

// Delete a review (Admin or Author only)
export async function deleteReview(req, res) {
    try {
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Check authorization (Admin or the user who wrote the review)
        if (req.User.role === "admin" || req.User.email === review.userEmail) {
            await Review.findByIdAndDelete(reviewId);
            return res.status(200).json({ message: "Review deleted successfully" });
        } else {
            return res.status(403).json({ message: "You cannot delete this review" });
        }

    } catch (error) {
        res.status(500).json({ message: "Error deleting review", error: error.message });
    }
}
