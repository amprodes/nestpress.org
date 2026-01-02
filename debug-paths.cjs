const fs = require('fs');
const path = require('path');

const jobDir = '/home/sofyserver/Downloads/nestpress-cms/backend/temp/themes/job-1766292257335-wjf0usg5x';
const themeRootDir = path.join(jobDir, 'enfold-business-flat');
const originalHTMLDir = path.join(jobDir, 'original-html');

console.log('Job Dir:', jobDir);
console.log('Theme Root:', themeRootDir);
console.log('Original HTML Dir:', originalHTMLDir);

if (fs.existsSync(originalHTMLDir)) {
    console.log('Original HTML Dir exists');
    const indexHtml = path.join(originalHTMLDir, 'index.html');
    if (fs.existsSync(indexHtml)) {
        console.log('index.html exists');
        const content = fs.readFileSync(indexHtml, 'utf-8');
        console.log('index.html size:', content.length);
    } else {
        console.log('index.html MISSING');
    }
} else {
    console.log('Original HTML Dir MISSING');
}

// Simulate generateFallbackTemplate logic
const type = 'home'; // index.tsx maps to home
let htmlPath = path.join(originalHTMLDir, `${type}.html`);
if (!fs.existsSync(htmlPath) && (type === 'home' || type === 'index')) {
    htmlPath = path.join(originalHTMLDir, 'index.html');
}
console.log('Resolved HTML Path:', htmlPath);

if (fs.existsSync(htmlPath)) {
    console.log('Resolved HTML Path exists');
    const originalHTML = fs.readFileSync(htmlPath, 'utf-8');
    console.log('Read HTML bytes:', originalHTML.length);

    try {
        // Extract body content and remove scripts
        const bodyMatch = originalHTML.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        let bodyContent = bodyMatch ? bodyMatch[1] : originalHTML;
        console.log('Body extracted bytes:', bodyContent.length);
        
        bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');
        console.log('Scripts removed bytes:', bodyContent.length);
        
        // Fix relative URLs
        bodyContent = bodyContent
          .replace(/src="https:\/\/kriesi\.at/g, 'src="https://kriesi.at')
          .replace(/url\(https:\/\/kriesi\.at/g, 'url(https://kriesi.at')
          .replace(/href="https:\/\/kriesi\.at\/themes\/enfold-business-flat\/#/g, 'href="#')
          .replace(/href="https:\/\/kriesi\.at\/themes\/enfold-business-flat\/"/g, 'href="/"')
          .replace(/href="https:\/\/kriesi\.at\/themes\/enfold-business-flat\/([^"]+)"/g, 'href="/$1"');
          
        console.log('URLs fixed bytes:', bodyContent.length);

        // Escape backticks and ${}
        const escapedHTML = bodyContent
          .replace(/\\/g, '\\\\')
          .replace(/`/g, '\\`')
          .replace(new RegExp('\\$\\{', 'g'), '\\${');
          
        console.log('Escaped bytes:', escapedHTML.length);
        console.log('SUCCESS');
    } catch (e) {
        console.error('CRASHED:', e);
    }
} else {
    console.log('Resolved HTML Path MISSING');
}
