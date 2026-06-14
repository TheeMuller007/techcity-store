import { pool } from "../db.js";

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products ORDER BY display_order ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching products" });
    }
};

// Get single product
export const getProductById = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching product" });
    }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, images, stock_quantity, rating, badge, specs } = req.body;
        const result = await pool.query(
            `INSERT INTO products (name, description, price, category, images, stock_quantity, rating, badge, specs)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [name, description, price, category, JSON.stringify(images || []), stock_quantity || 0, rating || 5, badge || '', JSON.stringify(specs || [])]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating product" });
    }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, images, stock_quantity, rating, badge, specs } = req.body;
        const result = await pool.query(
            `UPDATE products SET 
                name = $1, description = $2, price = $3, category = $4, 
                images = $5, stock_quantity = $6, rating = $7, badge = $8, specs = $9
             WHERE id = $10 RETURNING *`,
            [name, description, price, category, JSON.stringify(images), stock_quantity, rating, badge, JSON.stringify(specs), req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating product" });
    }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
    try {
        const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting product" });
    }
};

// Reorder products (Admin only)
export const reorderProducts = async (req, res) => {
    const client = await pool.connect();
    try {
        const { productIds, categoryUpdates } = req.body; 
        if (!Array.isArray(productIds)) {
            return res.status(400).json({ message: "Invalid productIds format" });
        }

        await client.query('BEGIN');
        
        // Update display_order
        for (let i = 0; i < productIds.length; i++) {
            await client.query(
                "UPDATE products SET display_order = $1 WHERE id = $2",
                [i, productIds[i]]
            );
        }

        // Update categories if provided
        if (Array.isArray(categoryUpdates)) {
            for (const update of categoryUpdates) {
                if (update.category) {
                    await client.query(
                        "UPDATE products SET category = $1 WHERE id = $2",
                        [update.category, update.id]
                    );
                }
            }
        }

        await client.query('COMMIT');
        res.json({ message: "Products reordered successfully" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Reorder Error:", err);
        res.status(500).json({ message: "Error reordering products" });
    } finally {
        client.release();
    }
};
