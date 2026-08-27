// Convert the original PeakBot HTML to valid JSX for AIBuilder.jsx
const fs = require('fs');

// Read the original HTML
let html = fs.readFileSync('original_html.txt', 'utf8');

// Extract only the content inside <main>
const mainStart = html.indexOf('<main');
const mainEnd = html.lastIndexOf('</main>');
if (mainStart === -1 || mainEnd === -1) {
  console.error('Could not find <main> tags');
  process.exit(1);
}
html = html.substring(html.indexOf('>', mainStart) + 1, mainEnd).trim();

// HTML to JSX conversions
let jsx = html;

// class -> className
jsx = jsx.replace(/\bclass="/g, 'className="');

// SVG attribute conversions
jsx = jsx.replace(/\bstroke-width="/g, 'strokeWidth="');
jsx = jsx.replace(/\bstroke-linecap="/g, 'strokeLinecap="');
jsx = jsx.replace(/\bstroke-linejoin="/g, 'strokeLinejoin="');
jsx = jsx.replace(/\bfill-rule="/g, 'fillRule="');
jsx = jsx.replace(/\bclip-rule="/g, 'clipRule="');
jsx = jsx.replace(/\bstroke-dasharray="/g, 'strokeDasharray="');
jsx = jsx.replace(/\bstroke-dashoffset="/g, 'strokeDashoffset="');

// tabindex -> tabIndex
jsx = jsx.replace(/\btabindex="/g, 'tabIndex="');

// for -> htmlFor
jsx = jsx.replace(/\bfor="/g, 'htmlFor="');

// Convert inline style strings to JSX objects
// style="opacity: 1;" -> style={{ opacity: "1" }}
// style="color: rgb(87, 242, 135);" -> style={{ color: "rgb(87, 242, 135)" }}
jsx = jsx.replace(/style="([^"]*)"/g, (match, styleStr) => {
  const props = styleStr.split(';').filter(s => s.trim());
  const pairs = props.map(prop => {
    const [key, ...valParts] = prop.split(':');
    if (!key || valParts.length === 0) return null;
    const camelKey = key.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const val = valParts.join(':').trim();
    return `${camelKey}: "${val}"`;
  }).filter(Boolean);
  return `style={{ ${pairs.join(', ')} }}`;
});

// Self-closing void elements
// <input ... > -> <input ... />
jsx = jsx.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');
jsx = jsx.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />');
jsx = jsx.replace(/<br([^>]*?)(?<!\/)>/g, '<br$1 />');
jsx = jsx.replace(/<hr([^>]*?)(?<!\/)>/g, '<hr$1 />');

// Remove closing tags for SVG elements we're making self-closing
const svgElements = ['line', 'path', 'circle', 'rect', 'polygon', 'polyline'];
svgElements.forEach(tag => {
  jsx = jsx.replace(new RegExp(`</${tag}>`, 'g'), '');
  jsx = jsx.replace(new RegExp(`<${tag}([^>]*?)(?<!\\/)>`, 'g'), `<${tag}$1 />`);
});

// Fix &amp; -> keep as &amp; (valid in JSX)
// Fix comments
jsx = jsx.replace(/<!--/g, '{/* ');
jsx = jsx.replace(/-->/g, ' */}');

// Wrap in component
const component = `import React from "react";

export default function AIBuilder({ guildId }) {
  return (
${jsx}
  );
}
`;

fs.writeFileSync('src/components/dashboard/tabs/AIBuilder.jsx', component);
console.log('Conversion complete! Written to AIBuilder.jsx');
