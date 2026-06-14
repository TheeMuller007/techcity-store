const pkg = require('pg');
const { Pool } = pkg;
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "yourpassword",
  database: process.env.DB_NAME || "techcity_db",
  port: process.env.DB_PORT || 5432
});

async function test() {
    try {
        console.log("Running query...");
        const result = await pool.query(`SELECT id, full_name, username, email, role, profile_pic, cart_data, wishlist_data, created_at FROM users ORDER BY id ASC`);
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}
test();
