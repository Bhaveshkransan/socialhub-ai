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
walk('src').forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let o = c;
  c = c.replace(/import\.meta\.env\.VITE_BACKEND_URL \+ "api/g, 'import.meta.env.VITE_BACKEND_URL + "/api');
  if (c !== o) {
    fs.writeFileSync(f, c);
    console.log('Fixed', f);
  }
});
