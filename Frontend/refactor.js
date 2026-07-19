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
    
    // Replace hardcoded strings
    // "http://localhost:8000
    // `http://localhost:8000
    // 'http://localhost:8000
    
    // Replace exact occurrences. We can just replace http://localhost:8000 with a Render URL for now,
    // Or replace with window.location.origin if we serve from backend.
    // Let's replace with a production variable.
    // Actually, the simplest approach for a beginner is to just define a constant in a file, but since we are modifying files, 
    // replacing "http://localhost:8000" with "https://socialhub-ai.onrender.com" is easiest if they name their Render service that!
    
    // Let's replace with an expression: (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com')
    // To avoid breaking template literals:
    // If it's inside `http://localhost...`, we change to `${import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com'}...`
    
    // Let's just create a generic API_URL constant at the top of the file if needed?
    // No, simple string replace:
    
    const API_DEV = "http://localhost:8000";
    const API_PROD = "https://socialhub-ai-backend.onrender.com"; // Predictable render URL
    
    if (content.includes("http://localhost:8000")) {
        // Replace `http://localhost:8000...` with `${import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com'}...`
        content = content.replace(/`http:\/\/localhost:8000/g, "`${import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com'}/");
        
        // Replace "http://localhost:8000..." with (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com') + "/..."
        content = content.replace(/"http:\/\/localhost:8000/g, "(import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com') + \"");
        
        // Replace 'http://localhost:8000...' with (import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com') + '/...'
        content = content.replace(/'http:\/\/localhost:8000/g, "(import.meta.env.MODE === 'development' ? 'http://localhost:8000' : 'https://socialhub-ai-backend.onrender.com') + '");
        
        // Fix double slashes that might result from the replace
        content = content.replace(/onrender\.com'\)\s*\+\s*"\//g, "onrender.com') + \"");
        content = content.replace(/onrender\.com'\)\s*\+\s*'\//g, "onrender.com') + '");
        content = content.replace(/onrender\.com}\/\//g, "onrender.com}/");
        
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
    }
});

console.log(`Updated ${changedFiles} files with dynamic URLs!`);
