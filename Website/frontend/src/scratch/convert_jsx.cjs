const fs = require('fs');

const inPath = 'c:\\Users\\lukeb\\OneDrive\\Projects\\Original\\Bots\\Orbit\\Website\\frontend\\src\\scratch\\extracted.html';
const outPath = 'c:\\Users\\lukeb\\OneDrive\\Projects\\Original\\Bots\\Orbit\\Website\\frontend\\src\\components\\dashboard\\tabs\\AIBuilder.jsx';

let html = fs.readFileSync(inPath, 'utf8');

// 1. Extract only the <main> part since Dashboard has its own sidebar/header
const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
if (mainMatch) {
    html = `<div className="relative w-full flex flex-col h-[calc(100dvh-4rem)] overflow-hidden">` + mainMatch[1] + `</div>`;
}

// 2. class -> className
html = html.replace(/class=/g, 'className=');

// 3. for -> htmlFor
html = html.replace(/for=/g, 'htmlFor=');

// 4. stroke-width -> strokeWidth, stroke-linecap -> strokeLinecap, stroke-linejoin -> strokeLinejoin
html = html.replace(/stroke-width=/g, 'strokeWidth=');
html = html.replace(/stroke-linecap=/g, 'strokeLinecap=');
html = html.replace(/stroke-linejoin=/g, 'strokeLinejoin=');

// 5. tabindex -> tabIndex
html = html.replace(/tabindex=/g, 'tabIndex=');

// 6. self closing tags
const selfClosing = ['input', 'img', 'br', 'hr', 'path', 'circle', 'line', 'polygon', 'rect', 'polyline'];
for (const tag of selfClosing) {
    const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
    html = html.replace(regex, `<${tag}$1 />`);
}

// 7. inline styles
html = html.replace(/style="([^"]*)"/g, (match, styleString) => {
    const styles = styleString.split(';').filter(s => s.trim()).map(s => {
        let [key, value] = s.split(':');
        key = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        return `${key}: '${value.trim()}'`;
    });
    return `style={{${styles.join(', ')}}}`;
});

// 8. comments
html = html.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

const jsx = `import React from 'react';
import { useParams } from 'react-router-dom';

export default function AIBuilder({ guildId }) {
    return (
        ${html}
    );
}
`;

fs.writeFileSync(outPath, jsx);
console.log('Converted to JSX successfully!');
