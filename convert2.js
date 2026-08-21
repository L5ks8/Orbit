const fs = require('fs');

let html = fs.readFileSync('raw.html', 'utf8');

// Extract just the <main> tag and its contents
const mainStart = html.indexOf('<main');
if (mainStart === -1) {
    console.error("Could not find <main> in the HTML.");
    process.exit(1);
}

let depth = 0;
let mainEnd = -1;

for (let i = mainStart; i < html.length; i++) {
    if (html.startsWith('<main', i)) {
        depth++;
    } else if (html.startsWith('</main>', i)) {
        depth--;
        if (depth === 0) {
            mainEnd = i + '</main>'.length;
            break;
        }
    }
}

if (mainEnd === -1) {
    console.error("Could not find closing </main>");
    process.exit(1);
}

let jsx = html.substring(mainStart, mainEnd);

// Standard HTML to JSX conversions
jsx = jsx.replace(/class=/g, 'className=');
jsx = jsx.replace(/tabindex=/g, 'tabIndex=');
jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
jsx = jsx.replace(/fill-rule=/g, 'fillRule=');
jsx = jsx.replace(/clip-rule=/g, 'clipRule=');
jsx = jsx.replace(/for=/g, 'htmlFor=');
jsx = jsx.replace(/autocomplete=/g, 'autoComplete=');

// Self-closing tags fix (SVG elements and inputs/imgs)
const voidElements = ['input', 'img', 'circle', 'path', 'line', 'rect', 'ellipse', 'polygon', 'polyline', 'br', 'hr'];
for (const tag of voidElements) {
    const regex = new RegExp(`<${tag}\\b([^>]*?)>`, 'g');
    jsx = jsx.replace(regex, (match, attrs) => {
        if (attrs.endsWith('/')) return match; // already self closed
        return `<${tag}${attrs}/>`;
    });
}

// Inline styles fix (from string to object)
jsx = jsx.replace(/style="([^"]*)"/g, (match, styleString) => {
    const rules = styleString.split(';').filter(r => r.trim().length > 0);
    const styleObj = {};
    for (const rule of rules) {
        const parts = rule.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            const value = parts.slice(1).join(':').trim();
            styleObj[key] = value;
        }
    }
    return `style={{ ${Object.entries(styleObj).map(([k, v]) => `${k}: "${v}"`).join(', ')} }}`;
});

// Re-wrap into Moderation.jsx
const finalCode = `import React from 'react';

export default function Moderation({ guildId }) {
  return (
    <div className="moderation-container w-full h-full">
      ${jsx}
    </div>
  );
}
`;

fs.writeFileSync('Website/frontend/src/components/dashboard/Moderation.jsx', finalCode);
console.log('Successfully wrote to Moderation.jsx!');
