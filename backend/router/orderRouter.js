import express from "express";
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, sendPaymentOTP, getSalesStats } from "../controllers/orderController.js";
import authorizeUser from "../lib/jwtMiddleware.js";

const orderRouter = express.Router();

// User routes
orderRouter.post("/", authorizeUser, createOrder);
orderRouter.post("/send-otp", authorizeUser, sendPaymentOTP);
orderRouter.get("/my-orders", authorizeUser, getMyOrders);

// Admin / Manager routes
orderRouter.get("/", authorizeUser, getAllOrders);
orderRouter.put("/:orderId/status", authorizeUser, updateOrderStatus);
orderRouter.get("/analytics/sales", authorizeUser, getSalesStats);

export default orderRouter;
