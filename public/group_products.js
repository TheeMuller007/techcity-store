const fs = require('fs');

try {
    const content = fs.readFileSync('scripts/products.js', 'utf8');
    const match = content.match(/const products = (\[[\s\S]*?\]);\s*\/\*PRODUCTS SCRIPT\*\//);
    if (!match) {
        console.error("Could not find products array.");
        process.exit(1);
    }
    
    // Evaluate the array
    const products = eval(match[1]);
    
    // Group by category
    const grouped = {};
    products.forEach(p => {
        const cat = p.category ? p.category.toLowerCase() : 'uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
    });
    
    let replacement = 'const products = [\n';
    
    Object.keys(grouped).forEach(cat => {
        replacement += `    // ==========================================\n`;
        replacement += `    // ${cat.toUpperCase()} CATEGORY\n`;
        replacement += `    // ==========================================\n`;
        
        grouped[cat].forEach(p => {
            // stringify and add indentation
            let pStr = JSON.stringify(p, null, 4);
            pStr = pStr.split('\n').map((line, idx) => idx === 0 ? '    ' + line : '    ' + line).join('\n');
            replacement += pStr + ',\n';
        });
    });
    
    // remove last comma
    replacement = replacement.replace(/,\n$/, '\n];\n/*PRODUCTS SCRIPT*/');
    
    const newContent = content.replace(/const products = \[[\s\S]*?\];\s*\/\*PRODUCTS SCRIPT\*\//, replacement);
    
    fs.writeFileSync('scripts/products.js', newContent);
    console.log("Successfully grouped products.");
} catch(e) {
    console.error("Error:", e);
}
