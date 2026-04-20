import express from "express";
import { addReview, getProductReviews, deleteReview } from "../controllers/reviewController.js";
import authorizeUser from "../lib/jwtMiddleware.js";

const reviewRouter = express.Router();

// Get reviews for a specific product
reviewRouter.get("/:productId", getProductReviews);

// Add a new review (Must be logged in)
reviewRouter.post("/", authorizeUser, addReview);

// Delete a review (Only the creator or admin can do this)
reviewRouter.delete("/:id", authorizeUser, deleteReview);

export default reviewRouter;
