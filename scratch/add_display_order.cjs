const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function migrate() {
  try {
    console.log('Running migration: Adding display_order to products...');
    
    // Check if column exists
    const checkCol = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='display_order'
    `);

    if (checkCol.rows.length === 0) {
      await pool.query('ALTER TABLE products ADD COLUMN display_order INTEGER DEFAULT 0');
      console.log('✅ Column display_order added.');
      
      // Initialize display_order with ID values to maintain current order
      await pool.query('UPDATE products SET display_order = id');
      console.log('✅ display_order initialized with ID values.');
    } else {
      console.log('ℹ️ Column display_order already exists.');
    }

    console.log('✅ Migration successful.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
