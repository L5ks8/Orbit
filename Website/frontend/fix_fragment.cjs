const fs = require('fs');

const file = 'src/components/dashboard/tabs/Security.jsx';
let content = fs.readFileSync(file, 'utf8');

// Undo the first replacement
content = content.replace('</main>\n    </>', '</main>');

// Replace the LAST </main> with </main>\n    </>
const lastIndex = content.lastIndexOf('</main>');
if (lastIndex !== -1) {
    content = content.substring(0, lastIndex) + '</main>\n    </>' + content.substring(lastIndex + 7);
}

fs.writeFileSync(file, content);
