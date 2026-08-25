const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

// Remove WithLoading component definition
content = content.replace(/function WithLoading\(\{ required, serverData, children \}\) \{\s*if \(required\.some\(k => !serverData\?\.\[k\]\)\) \{\s*return <div className="flex-1 flex items-center justify-center min-h-\[500px\]"><LoadingScreen \/><\/div>;\s*\}\s*return children;\s*\}/g, '');

// Remove WithLoading wrapper from all Routes
content = content.replace(/<WithLoading required=\{\[.*?\]\} serverData=\{serverData\}>/g, '');
content = content.replace(/<\/WithLoading>/g, '');

fs.writeFileSync('src/pages/Dashboard.jsx', content);
console.log("Removed WithLoading wrappers");
