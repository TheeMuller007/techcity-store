import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');

function findShopCssFiles(dir, files = []) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            findShopCssFiles(filePath, files);
        } else if (file === 'shop.css') {
            files.push(filePath);
        }
    });
    return files;
}

const cssFiles = findShopCssFiles(publicDir);
console.log(`Found ${cssFiles.length} shop.css files.`);

cssFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern to match the hover rule
    const hoverRule = /\.product-card:hover \.product-specs-overlay\s*\{[^}]+\}/g;
    
    if (content.match(hoverRule)) {
        console.log(`Disabling hover specs in ${filePath}...`);
        content = content.replace(hoverRule, '/* Hover specs disabled as requested */');
        
        // Also ensure the overlay is hidden by default
        const baseRule = /\.product-specs-overlay\s*\{/g;
        if (content.match(baseRule)) {
            content = content.replace(baseRule, '.product-specs-overlay { display: none !important; ');
        }
        
        fs.writeFileSync(filePath, content);
    } else {
        console.log(`Hover rule not found in ${filePath}.`);
        // Force hide anyway
        content += "\n\n.product-specs-overlay { display: none !important; }\n";
        fs.writeFileSync(filePath, content);
    }
});

console.log('All shop.css files updated.');
