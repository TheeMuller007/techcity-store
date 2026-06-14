const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Support Supabase via DATABASE_URL or local Postgres via individual vars
const connectionString = process.env.DATABASE_URL;

async function setup() {
  let appPool;

  if (connectionString) {
    // ─── Supabase Mode ───────────────────────────
    console.log('🌐 Using DATABASE_URL (Supabase mode) — skipping database creation.');
    appPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  } else {
    // ─── Local Mode ──────────────────────────────
    console.log('🏠 Using local Postgres — checking database...');
    const initialPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      database: 'postgres'
    });

    try {
      const res = await initialPool.query("SELECT 1 FROM pg_database WHERE datname='techcity_db'");
      if (res.rows.length === 0) {
        console.log('Creating database techcity_db...');
        await initialPool.query('CREATE DATABASE techcity_db');
        console.log('Database created.');
      } else {
        console.log('Database techcity_db already exists.');
      }
    } catch (err) {
      console.error('Error with db creation:', err);
    } finally {
      await initialPool.end();
    }

    appPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    });
  }

  // ─── Create Tables (both modes) ──────────────
  try {
    console.log('Checking for users table...');
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        profile_pic TEXT,
        cart_data JSONB DEFAULT '[]',
        wishlist_data JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready.');

    console.log('Checking for products table...');
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        category VARCHAR(100),
        images JSONB DEFAULT '[]',
        stock_quantity INTEGER DEFAULT 0,
        rating NUMERIC(3, 1) DEFAULT 5.0,
        badge VARCHAR(50),
        specs JSONB DEFAULT '[]',
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Products table ready.');

    console.log('Checking for orders table...');
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total_price NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        shipping_address JSONB,
        delivery_option VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Orders table ready.');

    console.log('Checking for order_items table...');
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        price_at_purchase NUMERIC(10, 2) NOT NULL
      )
    `);
    console.log('✅ Order items table ready.');

    console.log('\n🎉 All tables created successfully!');
  } catch(err) {
    console.error('❌ Error creating table:', err);
  } finally {
    await appPool.end();
  }
}
setup();

