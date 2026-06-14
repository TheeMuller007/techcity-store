const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function resetTable() {
  try {
    console.log('Resetting users table...');
    
    // Drop the table first
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('Table dropped.');

    // Create the table with correct schema
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table created successfully with columns: id, full_name, name, email, username, password, role, created_at');
    
  } catch (err) {
    console.error('Error resetting table:', err);
  } finally {
    await pool.end();
  }
}

resetTable();
