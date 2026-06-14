const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function checkAndFixRole() {
  try {
    const res = await pool.query("SELECT username, role FROM users WHERE username = 'admin'");
    if (res.rows.length > 0) {
      console.log('Current user data:', res.rows[0]);
      if (res.rows[0].role !== 'admin') {
        console.log('Promoting user to admin...');
        await pool.query("UPDATE users SET role = 'admin' WHERE username = 'admin'");
        console.log('User promoted successfully.');
      } else {
        console.log('User is already an admin.');
      }
    } else {
      console.log('User admin not found.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkAndFixRole();
