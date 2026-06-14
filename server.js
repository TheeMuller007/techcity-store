import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";

dotenv.config();
const app = express();

// =========================
// ES Module __dirname fix
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { pool } from "./db.js";

// =========================
// Middleware
// Allow requests from Netlify and local development
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5500",
  "https://techcitystore.netlify.app",
  process.env.RENDER_EXTERNAL_URL  // Auto-set by Render
].filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "10mb" })); // Allow large profile pics (base64)

// =========================
// Serve frontend static files (local development only)
// In production, Netlify serves the frontend
// =========================
if (process.env.NODE_ENV !== "production") {
  app.use(express.static(path.join(__dirname, "public")));
}

// =========================
// JWT Auth Middleware
// =========================
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

// =========================
// API Routes
// =========================
app.use("/api", (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// --- User: Sync cart, wishlist, profile pic to DB ---
app.post("/api/user/sync", verifyToken, async (req, res) => {
  try {
    const { cart, wishlist, profile_pic } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (cart !== undefined) {
      updates.push(`cart_data = $${idx++}`);
      values.push(JSON.stringify(cart));
    }
    if (wishlist !== undefined) {
      updates.push(`wishlist_data = $${idx++}`);
      values.push(JSON.stringify(wishlist));
    }
    if (profile_pic !== undefined) {
      updates.push(`profile_pic = $${idx++}`);
      values.push(profile_pic);
    }

    if (updates.length === 0) {
      return res.json({ message: "Nothing to update" });
    }

    values.push(req.user.id);
    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx}`,
      values
    );
    res.json({ message: "Synced successfully" });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ message: "Error syncing user data" });
  }
});

// --- User: Get profile data (cart, wishlist, pic) ---
app.get("/api/user/profile", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, username, email, role, profile_pic, cart_data, wishlist_data FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// --- Admin: Get all users with full data ---
app.get("/api/admin/users-full", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const result = await pool.query(
      `SELECT id, full_name, username, email, role, profile_pic,
              cart_data, wishlist_data, created_at
       FROM users ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// --- Admin: Simple users route (no auth required for legacy compat) ---
app.get("/api/admin/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, username, email, role, created_at FROM users ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// --- Admin: Delete a user ---
app.delete("/api/admin/users/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const targetId = parseInt(req.params.id);
    if (targetId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id, username", [targetId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ message: `User '${result.rows[0].username}' deleted successfully.` });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// =========================
// Catch-all: serve index.html locally, 404 JSON in production
// =========================
if (process.env.NODE_ENV !== "production") {
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
  });
}

// =========================
// Start server
// =========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});