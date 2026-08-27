const fs = require('fs');
const lines = fs.readFileSync('src/components/dashboard/tabs/AIBuilder.jsx', 'utf8').split('\n');

// Find the line where Plan starts
const planStart = lines.findIndex(l => l.includes('data-tour="builder-plan"')) - 1;

// Insert two </div> tags before planStart, indented at 16 spaces and 14 spaces
lines.splice(planStart, 0, '                </div>', '              </div>');

// Remove the last 2 </div> tags before the return statement.
let removed = 0;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('</div>')) {
    lines.splice(i, 1);
    removed++;
    if (removed === 2) break;
  }
}

fs.writeFileSync('src/components/dashboard/tabs/AIBuilder.jsx', lines.join('\n'));
console.log('Fixed nesting!');
