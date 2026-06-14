const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function migrate() {
  try {
    console.log('Running migration...');
    await pool.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS profile_pic TEXT,
        ADD COLUMN IF NOT EXISTS cart_data JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS wishlist_data JSONB DEFAULT '[]'
    `);
    console.log('✅ Migration successful. Columns added: profile_pic, cart_data, wishlist_data');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
