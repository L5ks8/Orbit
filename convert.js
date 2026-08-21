const fs = require('fs');

let html = fs.readFileSync('input.html', 'utf8');

// Basic class to className
html = html.replace(/class=/g, 'className=');
html = html.replace(/for=/g, 'htmlFor=');
html = html.replace(/tabindex=/g, 'tabIndex=');

// Self close tags
html = html.replace(/<img([^>]*)>/g, (match) => match.endsWith('/>') ? match : match.replace(/>$/, ' />'));
html = html.replace(/<input([^>]*)>/g, (match) => match.endsWith('/>') ? match : match.replace(/>$/, ' />'));
html = html.replace(/<br([^>]*)>/g, (match) => match.endsWith('/>') ? match : match.replace(/>$/, ' />'));
html = html.replace(/<hr([^>]*)>/g, (match) => match.endsWith('/>') ? match : match.replace(/>$/, ' />'));
html = html.replace(/\/>>/g, '/>'); // fix double slashes if they happen

// Convert style string to object
html = html.replace(/style="([^"]*)"/g, (match, styleStr) => {
    const styles = styleStr.split(';').map(s => s.trim()).filter(Boolean);
    const styleObj = styles.map(s => {
        const idx = s.indexOf(':');
        if(idx === -1) return '';
        const k = s.slice(0, idx).trim();
        const v = s.slice(idx + 1).trim();
        // camelCase key
        const kCamel = k.split('-').map((part, i) => i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)).join('');
        return `'${kCamel}': '${v}'`;
    }).filter(Boolean);
    return `style={{ ${styleObj.join(', ')} }}`;
});

// SVG attributes to camelCase
const attrs = ['stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'clip-path'];
for (const attr of attrs) {
    const camel = attr.split('-').map((part, i) => i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)).join('');
    html = html.split(attr).join(camel);
}

// Extract only <main>...</main>
const start = html.indexOf('<main');
const end = html.indexOf('</main>') + 7;
if (start !== -1 && end !== -1) {
    html = html.substring(start, end);
}

const out = `import React from 'react';

export default function Moderation({ guildId }) {
  return (
    <div className="moderation-container w-full h-full">
      ${html}
    </div>
  );
}
`;

fs.writeFileSync('Website/frontend/src/components/dashboard/Moderation.jsx', out);
console.log('Done');
