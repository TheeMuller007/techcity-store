const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'")
  .then(res => {
    console.log('Columns found:');
    res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
