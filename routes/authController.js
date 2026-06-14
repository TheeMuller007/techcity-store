// backend/controllers/authController.js
import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register
export const registerUser = async (req, res) => {
  try {
    const { full_name, username, email, password } = req.body;
    if (!full_name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check existing
    const existing = await pool.query(
      "SELECT * FROM users WHERE username=$1 OR email=$2",
      [username, email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await pool.query(
      "INSERT INTO users(full_name, username, email, password) VALUES($1,$2,$3,$4) RETURNING id",
      [full_name, username, email, hashedPassword]
    );

    res.status(201).json({ message: "Registration successful!" });

  } catch (err) {
    console.error("REGISTER ERROR:", err.message, err.code, err.detail);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const userResult = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    const user = userResult.rows[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: "Invalid username or password." });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });

  } catch (err) {
    console.error("LOGIN ERROR:", err.message, err.code, err.detail);
    res.status(500).json({ message: "Server error" });
  }
};