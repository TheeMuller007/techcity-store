const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function fixSpecs() {
  const laptopSpecs = JSON.stringify([
    "Intel Core i7 12th Gen Processor",
    "16GB DDR5 4800MHz RAM",
    "512GB NVMe PCIe Gen4 SSD",
    "15.6\" FHD (1920x1080) IPS Display",
    "Windows 11 Pro Pre-installed",
    "Backlit Chiclet Keyboard"
  ]);

  const smartphoneSpecs = JSON.stringify([
    "Snapdragon 8 Gen 2 Mobile Platform",
    "8GB LPDDR5X RAM / 256GB UFS 4.0",
    "6.7\" AMOLED 120Hz LTPO Display",
    "50MP Main + 12MP Ultra-wide + 10MP Telephoto",
    "5000mAh Battery with 65W Fast Charging",
    "IP68 Water and Dust Resistance"
  ]);

  const accessorySpecs = JSON.stringify([
    "Premium Sound with Active Noise Cancellation",
    "Up to 40 Hours of Playtime per charge",
    "Bluetooth 5.2 Low Latency Connection",
    "Built-in Studio Quality Microphone",
    "Ergonomic Design for all-day comfort",
    "Universal Compatibility (iOS, Android, PC)"
  ]);

  const printerSpecs = JSON.stringify([
    "All-in-One: Print, Scan, and Copy",
    "High-Speed Wireless Connectivity",
    "22 Pages Per Minute (Black & White)",
    "Automatic Two-Sided (Duplex) Printing",
    "High-Capacity Ink Tank System",
    "TechCity Mobile App Integration"
  ]);

  try {
    console.log('Updating specs for Laptops...');
    await pool.query("UPDATE products SET specs = $1 WHERE category ILIKE '%laptop%'", [laptopSpecs]);
    
    console.log('Updating specs for Smartphones...');
    await pool.query("UPDATE products SET specs = $1 WHERE category ILIKE '%phone%' OR category ILIKE '%mobile%'", [smartphoneSpecs]);
    
    console.log('Updating specs for Accessories...');
    await pool.query("UPDATE products SET specs = $1 WHERE category ILIKE '%accessory%' OR category ILIKE '%headphone%' OR category ILIKE '%watch%'", [accessorySpecs]);
    
    console.log('Updating specs for Printers...');
    await pool.query("UPDATE products SET specs = $1 WHERE category ILIKE '%printer%'", [printerSpecs]);

    console.log('Update complete!');
  } catch (err) {
    console.error('Error updating specs:', err);
  } finally {
    await pool.end();
  }
}

fixSpecs();
