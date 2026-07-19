import fs from 'fs';

let c = fs.readFileSync('controllers/user.controller.js', 'utf8');
c = c.replace(/sameSite:\s*"strict"/g, 'sameSite: "none", secure: true');
fs.writeFileSync('controllers/user.controller.js', c);
console.log('Fixed cookies');
