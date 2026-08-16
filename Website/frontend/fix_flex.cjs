const fs = require('fs');
const path = require('path');
const dir = './src/components/dashboard/modules';
const files = fs.readdirSync(dir);
for (const file of files) {
  if (file.endsWith('.jsx')) {
    let p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/display:\s*'flex',\s*justifyContent/g, "display: 'flex', flexDirection: 'row', justifyContent");
    fs.writeFileSync(p, content);
  }
}
console.log('Fixed flex direction');
