const fs = require('fs');
const path = require('path');

const DIR = __dirname;

fs.readdirSync(DIR).forEach(file => {
    if (!file.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(path.join(DIR, file), 'utf8');
    const original = content;

    // 1. Add SaveBar import
    if (!content.includes('import SaveBar')) {
        content = content.replace("import React", "import SaveBar from '../../ui/SaveBar';\nimport React");
    }

    // 2. Add onReset to props
    // Pattern: export default function XSettings({ config, channels, onSave, saving }) {
    content = content.replace(/export default function ([A-Za-z0-9_]+)\(\{\s*(.*?)\s*\}\)\s*\{/g, (match, name, props) => {
        if (!props.includes('onReset')) {
            return `export default function ${name}({ ${props}, onReset }) {`;
        }
        return match;
    });

    // 3. Convert handleSave to getPayload
    // Find: const handleSave = () => {\n    onSave({ ... });\n  };
    // Replace with: const getPayload = () => ({ ... });
    
    // Some components (like Automod, Ticket) might have logic inside handleSave, e.g. `const payload = ...`
    // Let's handle standard ones that just do `onSave({ ... })`
    const simpleSaveRegex = /const handleSave = \(\) => \{\s*onSave\(([\s\S]*?)\);\s*\};/g;
    
    if (simpleSaveRegex.test(content)) {
        content = content.replace(simpleSaveRegex, (match, payloadObj) => {
            return `const getPayload = () => (${payloadObj});

  const [initialState] = React.useState(() => JSON.stringify(getPayload()));
  const isDirty = JSON.stringify(getPayload()) !== initialState;

  const handleSave = () => {
    onSave(getPayload());
  };`;
        });
    } else {
        // If it has complex logic, e.g. `AutomodSettings.jsx`:
        // const handleSaveAll = () => { ... onSave({ automod: payload }); };
        // We will have to handle these manually or print a warning.
        console.warn(`Complex save logic in ${file}, skipping regex for getPayload`);
    }

    // 4. Remove all individual Save buttons
    // e.g. <button className="dash-btn primary" onClick={handleSave} disabled={saving}>Save Changes</button>
    // or similar.
    content = content.replace(/<button[^>]*onClick=\{handleSave\}[^>]*>[\s\S]*?<\/button>/g, '');
    content = content.replace(/<button[^>]*onClick=\{handleSaveAll\}[^>]*>[\s\S]*?<\/button>/g, '');

    // 5. Inject <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} /> before the last </div>
    if (content.includes('isDirty') && !content.includes('<SaveBar')) {
        // Find the last </div>
        const lastDivIndex = content.lastIndexOf('</div>');
        if (lastDivIndex !== -1) {
            const saveBarJsx = `\n      <SaveBar show={isDirty} onReset={onReset} onSave={handleSave} saving={saving} />\n    `;
            content = content.slice(0, lastDivIndex) + saveBarJsx + content.slice(lastDivIndex);
        }
    }

    if (content !== original) {
        fs.writeFileSync(path.join(DIR, file), content, 'utf8');
        console.log(`Processed ${file}`);
    }
});
