const fs = require('fs');
const lines = fs.readFileSync('src/components/dashboard/tabs/Security.jsx', 'utf8').split('\n');
lines.forEach((l, i) => {
    if(l.includes('role="switch"')) {
        const text = lines.slice(Math.max(0, i-20), i).join(' ').replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
        console.log(`Line ${i}: ${text.substring(text.length - 80)}`);
    }
});
