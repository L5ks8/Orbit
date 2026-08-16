const fs = require('fs');
const path = require('path');

const dir = './src/components/dashboard/modules';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (!file.endsWith('.jsx')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove the toggle line: <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
  // Also remove the globalToggle from Welcome, Tickets, Automod, Autoresponder if present.
  
  content = content.replace(/<Toggle[^>]+checked=\{[a-zA-Z]+\}[^>]+onChange=\{[^}]+\}\s*\/>/g, '');
  
  // Optionally remove the imports for Toggle if they are unused, but let's just let the linter deal with it or leave it.
  
  fs.writeFileSync(filePath, content);
});

console.log('Toggles removed');
