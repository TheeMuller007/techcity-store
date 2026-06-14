import express from "express";
import { 
    createOrder, 
    getUserOrders, 
    getAllOrders, 
    updateOrderStatus,
    cancelOrder
} from "../controllers/orderController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify token and add user to req
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ message: "Invalid token" });
    }
}

router.post("/", verifyToken, createOrder);
router.get("/my-orders", verifyToken, getUserOrders);
router.get("/admin/all", verifyToken, getAllOrders);
router.put("/admin/:id/status", verifyToken, updateOrderStatus);
router.put("/:id/cancel", verifyToken, cancelOrder);

export default router;
