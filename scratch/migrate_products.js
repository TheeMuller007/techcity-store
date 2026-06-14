import fs from 'fs';
import { pool } from '../db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
    try {
        const filePath = path.join(__dirname, '../public/scripts/products.js');
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract the array part
        const startIdx = content.indexOf('const products = [');
        const endIdx = content.indexOf('];', startIdx) + 2;
        
        if (startIdx === -1 || endIdx === -1) {
            throw new Error("Could not find products array in file");
        }
        
        const arrayStr = content.substring(startIdx + 'const products = '.length, endIdx - 1);
        
        // We can't use JSON.parse because it's JS, not pure JSON.
        // We'll use a safer approach by evaluating it in a function that returns it.
        const products = eval(arrayStr);
        
        console.log(`Found ${products.length} products. Migrating to database...`);
        
        // Clear existing products first to avoid duplicates if re-running
        await pool.query('DELETE FROM products');
        
        for (const p of products) {
            const images = p.images || (p.image ? [p.image] : []);
            const specs = p.specs || [];
            
            await pool.query(
                `INSERT INTO products (name, price, category, images, rating, badge, specs, stock_quantity)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    p.name, 
                    p.price, 
                    p.category, 
                    JSON.stringify(images), 
                    p.rating || 5, 
                    p.badge || '', 
                    JSON.stringify(specs), 
                    Math.floor(Math.random() * 50) + 10 // Random stock between 10-60
                ]
            );
        }
        
        console.log("Migration successful!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
