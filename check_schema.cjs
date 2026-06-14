const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

pool.query("SELECT table_schema, column_name FROM information_schema.columns WHERE table_name = 'users'")
  .then(res => {
    console.log('Results:');
    res.rows.forEach(row => console.log(`- Schema: ${row.table_schema}, Column: ${row.column_name}`));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
