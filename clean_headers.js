const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\berkm\\Downloads\\Orbit\\Orbit\\Website\\frontend\\src\\components\\dashboard\\modules';
const pattern = /^\s*<div className="dash-settings-header">\s*<div className="settings-title-row">\s*<div>\s*<h1 className="dash-title">.*?<\/h1>\s*<p className="dash-subtitle".*?>.*?<\/p>\s*<\/div>\s*<\/div>\s*<\/div>/gm;

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.jsx')) {
    const p = path.join(dir, file);
    const content = fs.readFileSync(p, 'utf-8');
    const newContent = content.replace(pattern, '');
    if (content !== newContent) {
      fs.writeFileSync(p, newContent);
      console.log('Updated ' + file);
    }
  }
});
