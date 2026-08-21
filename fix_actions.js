const fs = require('fs');
let content = fs.readFileSync('Website/frontend/src/components/dashboard/Moderation.jsx', 'utf8');

// The action selector regex: it starts with <div className="flex flex-wrap gap-0.5 p-0.5 rounded-xl bg-neutral-800">
// and ends with </div> after the 5 buttons.
const actionRegex = /<div className="flex flex-wrap gap-0\.5 p-0\.5 rounded-xl bg-neutral-800">[\s\S]*?Ban<\/button>\s*<\/div>/g;

let matches = content.match(actionRegex) || [];
console.log(`Found ${matches.length} action selectors`);

if (matches.length > 0) {
  const states = [
    { val: 'bannedWords.action', setter: "(val) => setBannedWords({...bannedWords, action: val})" },
    { val: 'antiSpam.action', setter: "(val) => setAntiSpam({...antiSpam, action: val})" },
    { val: 'antiLink.action', setter: "(val) => setAntiLink({...antiLink, action: val})" },
    { val: 'antiInvites.action', setter: "(val) => setAntiInvites({...antiInvites, action: val})" },
    { val: 'mentionSpam.action', setter: "(val) => setMentionSpam({...mentionSpam, action: val})" },
    { val: 'antiZalgo.action', setter: "(val) => setAntiZalgo({...antiZalgo, action: val})" },
    { val: 'antiCaps.action', setter: "(val) => setAntiCaps({...antiCaps, action: val})" }
  ];
  
  let matchIndex = 0;
  content = content.replace(actionRegex, (match) => {
    if (matchIndex < states.length) {
      const state = states[matchIndex++];
      return `<ActionSelector value={${state.val}} onChange={${state.setter}} />`;
    }
    return match; // If there are more, just leave them
  });
}

// Write back
fs.writeFileSync('Website/frontend/src/components/dashboard/Moderation.jsx', content);
console.log('Action selectors updated.');
