const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function diagnose() {
  console.log('Testing manual INSERT into users table...');
  const testEmail = `test_${Date.now()}@example.com`;
  const testUser = `testuser_${Date.now()}`;
  const hashedPass = await bcrypt.hash('password123', 10);

  try {
    const res = await pool.query(
      "INSERT INTO users(full_name, email, username, password) VALUES($1, $2, $3, $4) RETURNING id",
      ["Test User", testEmail, testUser, hashedPass]
    );
    console.log('Insert SUCCESSFUL, ID:', res.rows[0].id);
  } catch (err) {
    console.error('--- DATABASE ERROR CAPTURED ---');
    console.error('Message:', err.message);
    console.error('Detail:', err.detail);
    console.error('Hint:', err.hint);
    console.error('Where:', err.where);
    console.error('Schema:', err.schema);
    console.error('Table:', err.table);
    console.error('Column:', err.column);
    console.error('Code:', err.code);
  } finally {
    await pool.end();
  }
}

diagnose();
