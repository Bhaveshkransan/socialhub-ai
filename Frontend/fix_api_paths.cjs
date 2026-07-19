const fs = require('fs');
const path = require('path');

function walk(d) {
  let r = [];
  fs.readdirSync(d).forEach(f => {
    f = path.join(d, f);
    if (fs.statSync(f).isDirectory()) r = r.concat(walk(f));
    else if (f.endsWith('.js') || f.endsWith('.jsx')) r.push(f);
  });
  return r;
}

const files = walk('src');
for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Replace: import.meta.env.VITE_BACKEND_URL + "/api
  // With: "/api
  if (c.includes('import.meta.env.VITE_BACKEND_URL + "/api')) {
    c = c.replace(/import\.meta\.env\.VITE_BACKEND_URL \+ "\/api/g, '"/api');
    changed = true;
  }
  
  // Replace template literals: `${import.meta.env.VITE_BACKEND_URL}/api
  // With: `/api
  if (c.includes('${import.meta.env.VITE_BACKEND_URL}/api')) {
    c = c.replace(/\$\{import\.meta\.env\.VITE_BACKEND_URL\}\/api/g, '/api');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, c);
    console.log(`Updated ${file}`);
  }
}
