import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { sendEmail, getRegistrationEmail } from "../utils/email.js";

// Register new user
export const registerUser = async (req, res) => {
    try {
        const { full_name, email, username, password } = req.body;

        // Check if email exists
        const existing = await pool.query("SELECT * FROM users WHERE email=$1 OR username=$2", [email, username]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Email or username already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        await pool.query(
            "INSERT INTO users(full_name, email, username, password) VALUES($1,$2,$3,$4)",
            [full_name, email, username, hashedPassword]
        );
        
        // Send Welcome Email (Background)
        (async () => {
            try {
                const emailHtml = getRegistrationEmail(username);
                await sendEmail(email, "Welcome to TechCity!", emailHtml);
            } catch (emailErr) {
                console.error("Failed to send welcome email:", emailErr);
            }
        })();

        res.status(201).json({ message: "Registration successful!" });
    } catch (err) {
        console.error("Registration Error Details:", {
            message: err.message,
            code: err.code,
            detail: err.detail,
            table: err.table,
            column: err.column
        });
        res.status(500).json({ message: "Server error during registration" });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, username, identifier, password } = req.body;
        const loginVal = identifier || email || username;

        if (!loginVal) {
            return res.status(400).json({ message: "Email or username is required." });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1 OR username=$1", 
            [loginVal]
        );
        
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const user = result.rows[0];

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // Create JWT token including role
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "7d" }
        );
 
         res.json({ 
            message: "Login successful", 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                profile_pic: user.profile_pic,
                cart_data: user.cart_data,
                wishlist_data: user.wishlist_data
            } 
        });
    } catch (err) {
        console.error("Login Error Details:", {
            message: err.message,
            code: err.code,
            detail: err.detail
        });
        res.status(500).json({ message: "Server error during login" });
    }
};