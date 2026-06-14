import express from "express";
import { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    reorderProducts
} from "../controllers/productController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to check admin role
function isAdmin(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        if (user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
        req.user = user;
        next();
    } catch {
        return res.status(403).json({ message: "Invalid token" });
    }
}

router.get("/", getAllProducts);
router.post("/", isAdmin, createProduct);
router.put("/reorder/all", isAdmin, reorderProducts);
router.get("/:id", getProductById);
router.put("/:id", isAdmin, updateProduct);
router.delete("/:id", isAdmin, deleteProduct);

export default router;
