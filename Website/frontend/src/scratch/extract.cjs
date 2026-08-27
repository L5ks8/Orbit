const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\lukeb\\.gemini\\antigravity-ide\\brain\\28709f82-ea61-42c8-bcbb-5e5980eca1a3\\.system_generated\\logs\\transcript_full.jsonl';
const outPath = 'c:\\Users\\lukeb\\OneDrive\\Projects\\Original\\Bots\\Orbit\\Website\\frontend\\src\\scratch\\extracted.html';

const data = fs.readFileSync(logPath, 'utf8');
const lines = data.split('\n');

for (const line of lines) {
    if (!line) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.type === 'USER_INPUT' && obj.content && obj.content.includes('ok gut dann mache das den Ai Buidler tab')) {
            const htmlStart = obj.content.indexOf('<div class="lg:pl-64');
            if (htmlStart !== -1) {
                const html = obj.content.substring(htmlStart);
                fs.writeFileSync(outPath, html);
                console.log(`Extracted HTML of length: ${html.length}`);
                break;
            }
        }
    } catch (e) {
        // ignore JSON parse errors for lines
    }
}
