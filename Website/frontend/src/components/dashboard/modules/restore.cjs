const fs = require('fs');
const path = require('path');

const DIR = __dirname;

fs.readdirSync(DIR).forEach(file => {
    if (file.endsWith('.jsx')) {
        let content = fs.readFileSync(path.join(DIR, file), 'utf8');
        if (content.includes('<Toggle') && !content.includes('import Toggle from')) {
            content = content.replace("import React", "import Toggle from '../../ui/Toggle';\nimport React");
            fs.writeFileSync(path.join(DIR, file), content, 'utf8');
            console.log('Fixed ' + file);
        }
    }
});
