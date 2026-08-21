const fs = require('fs');
let code = fs.readFileSync('Website/frontend/src/components/dashboard/Moderation.jsx', 'utf8');

// The global CSS button { display: flex; align-items: center; justify-content: center; } 
// messes up buttons that are supposed to act as cards (i.e. having block layout or default layout).
// By giving them the "block" class, we override display: flex.
// Let's add "block" to buttons that look like cards (e.g. have 'w-full' and 'text-left' or 'text-center').

code = code.replace(/<button([^>]*)className="([^"]*?)w-full([^"]*?)"/g, (match, p1, p2, p3) => {
    // If it doesn't already have block, add it
    let classes = p2 + 'w-full' + p3;
    if (!classes.includes('block') && !classes.includes('flex')) {
        classes = 'block ' + classes;
    }
    return `<button${p1}className="${classes}"`;
});

fs.writeFileSync('Website/frontend/src/components/dashboard/Moderation.jsx', code);
console.log('Fixed button display classes.');
