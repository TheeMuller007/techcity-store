import { pool } from "../db.js";
import { sendEmail, getOrderConfirmationEmail, getStatusUpdateEmail } from "../utils/email.js";

// Create new order
export const createOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        const { items, total_price, shipping_address, delivery_option } = req.body;
        const user_id = req.user.id;

        await client.query('BEGIN');

        // 1. Check stock for all items
        for (const item of items) {
            const productRes = await client.query("SELECT stock_quantity, name FROM products WHERE id = $1", [item.id]);
            if (productRes.rows.length === 0) throw new Error(`Product ${item.id} not found`);
            
            const product = productRes.rows[0];
            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`);
            }
        }

        // 2. Create Order
        const orderRes = await client.query(
            `INSERT INTO orders (user_id, total_price, status, shipping_address, delivery_option)
             VALUES ($1, $2, 'Pending', $3, $4) RETURNING *`,
            [user_id, total_price, JSON.stringify(shipping_address), delivery_option]
        );
        const order = orderRes.rows[0];

        // 3. Create Order Items and Reduce Stock
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                 VALUES ($1, $2, $3, $4)`,
                [order.id, item.id, item.quantity, item.price]
            );

            await client.query(
                "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2",
                [item.quantity, item.id]
            );
        }

        await client.query('COMMIT');
        
        // 4. Send Confirmation Email (Background)
        (async () => {
            try {
                // Get user email
                const userRes = await pool.query("SELECT email, username FROM users WHERE id = $1", [user_id]);
                const user = userRes.rows[0];
                
                // Get item names for email
                const itemsWithNames = [];
                for (const item of items) {
                    const p = await pool.query("SELECT name FROM products WHERE id = $1", [item.id]);
                    itemsWithNames.push({ ...item, name: p.rows[0].name });
                }

                const emailHtml = getOrderConfirmationEmail(order, itemsWithNames);
                await sendEmail(user.email, `Order Confirmation - #ORD-${order.id}`, emailHtml);
            } catch (emailErr) {
                console.error("Failed to send order email:", emailErr);
            }
        })();

        res.status(201).json({ message: "Order placed successfully", order });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(400).json({ message: err.message || "Error creating order" });
    } finally {
        client.release();
    }
};

// Get user orders
export const getUserOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, 
                (SELECT json_agg(oi) FROM (
                    SELECT oi.*, p.name as product_name, p.images->>0 as product_image 
                    FROM order_items oi 
                    JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = o.id
                ) oi) as items
             FROM orders o 
             WHERE o.user_id = $1 
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching orders" });
    }
};

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin only" });
        
        const result = await pool.query(
            `SELECT o.*, u.username, u.email,
                (SELECT json_agg(oi) FROM (
                    SELECT oi.*, p.name as product_name 
                    FROM order_items oi 
                    JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = o.id
                ) oi) as items
             FROM orders o 
             JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching all orders" });
    }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin only" });
        
        const { status } = req.body;
        const result = await pool.query(
            "UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [status, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Order not found" });
        const order = result.rows[0];

        // Send Status Update Email (Background)
        (async () => {
            try {
                const userRes = await pool.query("SELECT email FROM users WHERE id = $1", [order.user_id]);
                const user = userRes.rows[0];
                const emailHtml = getStatusUpdateEmail(order, status);
                await sendEmail(user.email, `Order Status Updated - #ORD-${order.id}`, emailHtml);
            } catch (emailErr) {
                console.error("Failed to send status update email:", emailErr);
            }
        })();

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating order" });
    }
};

// User: Cancel their own order (only if Pending)
export const cancelOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        // Verify the order belongs to this user and is still Pending
        const orderRes = await client.query(
            "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
            [orderId, userId]
        );
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        const order = orderRes.rows[0];
        if (order.status.toLowerCase() !== 'pending') {
            return res.status(400).json({ message: `Cannot cancel an order with status "${order.status}". Only Pending orders can be cancelled.` });
        }

        await client.query('BEGIN');

        // Restore stock quantities for each item
        const itemsRes = await client.query(
            "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
            [orderId]
        );
        for (const item of itemsRes.rows) {
            await client.query(
                "UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2",
                [item.quantity, item.product_id]
            );
        }

        // Mark order as Cancelled
        const updatedRes = await client.query(
            "UPDATE orders SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
            [orderId]
        );
        await client.query('COMMIT');

        // Optional: send cancellation email (background)
        (async () => {
            try {
                const userRes = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
                const user = userRes.rows[0];
                const emailHtml = getStatusUpdateEmail(updatedRes.rows[0], 'Cancelled');
                await sendEmail(user.email, `Order Cancelled - #ORD-${orderId}`, emailHtml);
            } catch (emailErr) {
                console.error("Failed to send cancellation email:", emailErr);
            }
        })();

        res.json({ message: "Order cancelled successfully", order: updatedRes.rows[0] });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Cancel order error:", err);
        res.status(500).json({ message: "Error cancelling order" });
    } finally {
        client.release();
    }
};

