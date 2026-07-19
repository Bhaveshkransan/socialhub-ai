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
    let original = content;

    // Pattern 1:
    // (import.meta.env.MODE === 'development' ? (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com') + '' : 'https://socialhub-ai-backend.onrender.com')
    const pattern1 = /\(import\.meta\.env\.MODE === 'development' \? \(import\.meta\.env\.MODE === 'development' \? 'http:\/\/localhost:8000' : 'https:\/\/socialhub-ai-backend\.onrender\.com'\) \+ '' : 'https:\/\/socialhub-ai-backend\.onrender\.com'\)\s*\+\s*""/g;
    content = content.replace(pattern1, "import.meta.env.VITE_BACKEND_URL");
    
    const pattern1_no_empty_str = /\(import\.meta\.env\.MODE === 'development' \? \(import\.meta\.env\.MODE === 'development' \? 'http:\/\/localhost:8000' : 'https:\/\/socialhub-ai-backend\.onrender\.com'\) \+ '' : 'https:\/\/socialhub-ai-backend\.onrender\.com'\)/g;
    content = content.replace(pattern1_no_empty_str, "import.meta.env.VITE_BACKEND_URL");

    // Pattern 2:
    // ${import.meta.env.MODE === 'development' ? (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com') + '' : 'https://socialhub-ai-backend.onrender.com'}//
    const pattern2 = /\$\{import\.meta\.env\.MODE === 'development' \? \(import\.meta\.env\.MODE === 'development' \? 'http:\/\/localhost:8000' : 'https:\/\/socialhub-ai-backend\.onrender\.com'\) \+ '' : 'https:\/\/socialhub-ai-backend\.onrender\.com'\}\/\//g;
    content = content.replace(pattern2, "${import.meta.env.VITE_BACKEND_URL}/");

    // Fallback for single /
    const pattern3 = /\$\{import\.meta\.env\.MODE === 'development' \? \(import\.meta\.env\.MODE === 'development' \? 'http:\/\/localhost:8000' : 'https:\/\/socialhub-ai-backend\.onrender\.com'\) \+ '' : 'https:\/\/socialhub-ai-backend\.onrender\.com'\}\//g;
    content = content.replace(pattern3, "${import.meta.env.VITE_BACKEND_URL}/");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
    }
});

console.log(`Updated ${changedFiles} files with correct VITE_BACKEND_URL`);
