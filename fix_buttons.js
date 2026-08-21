const fs = require('fs');
let code = fs.readFileSync('Website/frontend/src/components/dashboard/Moderation.jsx', 'utf8');

code = code.replace(/<button([^>]*)className="([^"]*?)w-full([^"]*?)"/g, (match, p1, p2, p3) => {
    let classes = p2 + 'w-full' + p3;
    if (!classes.includes('block') && !classes.includes('flex')) {
        classes = 'block ' + classes;
    }
    return `<button${p1}className="${classes}"`;
});

fs.writeFileSync('Website/frontend/src/components/dashboard/Moderation.jsx', code);
console.log('Fixed buttons');
