const fs = require('fs');
const path = require('path');
const file = path.join('d:', 'dekstop', 'BANK MANAGEMENT SYSTEM', 'frontend', 'src', 'App.jsx');

let content = fs.readFileSync(file, 'utf8');

// Replace all $ not followed by { with ₹
content = content.replace(/\$(?!\{)/g, '₹');

fs.writeFileSync(file, content);
console.log('Successfully updated currency to ₹');
