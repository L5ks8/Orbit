const fs = require('fs');

let html = fs.readFileSync('src/components/dashboard/Security/raw.html', 'utf8');

// Convert class to className
let jsx = html.replace(/class=/g, 'className=');

// Fix SVG attributes
jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');

// Fix tabindex
jsx = jsx.replace(/tabindex=/g, 'tabIndex=');

// Fix unclosed tags (img, input, line, circle, polygon, path - actually line/circle/polygon/path are usually empty and might need self-closing in JSX)
// Note: React 18 / standard JSX requires self closing tags for things with no children or strictly void elements.
jsx = jsx.replace(/<input([^>]*?[^\/])>/g, '<input$1 />');
jsx = jsx.replace(/<img([^>]*?[^\/])>/g, '<img$1 />');
// Some SVG elements need self closing if they are empty, but the raw HTML already has them closed properly or not?
// In the raw HTML, `<line ...></line>` is used which is valid JSX! 
// Let's check for <circle> and <polygon>. The raw HTML has `<circle cx="9" cy="7" r="4"></circle>` and `<polygon points="..."></polygon>`. These are perfectly valid in JSX.
// Same with `<path ...></path>`. Wait, looking at the HTML, it's actually `<path d="..."></path>`. Also valid JSX.

// Handle SVG properly - React SVG requires camelCase for some props. But strokeWidth, strokeLinecap, strokeLinejoin were handled.
// Check for xmlns
// It is fine.

const component = `import React from 'react';

export default function Security() {
  return (
    ${jsx}
  );
}
`;

fs.writeFileSync('src/components/dashboard/Security/Security.jsx', component);
