import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // We previously replaced it with this string:
    // (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com')
    // We want to change 'https://socialhub-ai-backend.onrender.com' to import.meta.env.VITE_BACKEND_URL
    
    if (content.includes("'https://socialhub-ai-backend.onrender.com'")) {
        content = content.replace(/'https:\/\/socialhub-ai-backend\.onrender\.com'/g, "import.meta.env.VITE_BACKEND_URL");
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
    }
});

console.log(`Updated ${changedFiles} files to use VITE_BACKEND_URL!`);
