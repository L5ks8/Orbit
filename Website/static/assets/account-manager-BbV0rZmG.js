import{j as e}from"./main-DJXeaSrE.js";let i={title:"Account Manager",description:"Store multiple accounts and launch the game with any of them, including multi-instance launching, auto-relaunch, groups, private servers, and live monitoring.",icon:"Users"},c={contents:[{heading:void 0,content:`The Account Manager is a built-in panel for storing multiple accounts and
launching the game with any of them, without signing in by hand every time. Each
account is added once by capturing its login session, which Volt stores locally
and encrypted. From there you can launch one or many accounts at once, point
them at a specific place or private server, automatically restart crashed
instances, watch each instance's live CPU, memory and connection status, and
organize everything into groups.`},{heading:void 0,content:"type: info"},{heading:void 0,content:`Launching, browser login and live process stats are Windows-only. Your
accounts never leave your machine. See Storage and
security.`},{heading:"opening-the-account-manager",content:"Activity bar: click the Account Manager item (people icon) on the side rail."},{heading:"opening-the-account-manager",content:'Command palette: search for "Account Manager: Open".'},{heading:"opening-the-account-manager",content:`Keep it docked in the main window, or use Dock / Overlay to pop it out into
its own window or a compact always-on-top monitor.`},{heading:"adding-accounts",content:`There are three ways to add accounts. However you add them, Volt fetches each
account's identity (username and display name), confirms the session is valid,
then encrypts and stores it. Accounts are de-duplicated automatically, so
re-adding an existing one simply updates it. After importing, a summary reports
how many accounts were imported, updated, and failed (with a reason
for each failure).`},{heading:"log-in-from-a-browser-recommended",content:`Click Login from Browser. Volt opens Microsoft Edge or Google Chrome in a
throwaway profile on the platform's login page. Sign in as you normally would.
Volt detects the session automatically, imports the account, and closes the
browser for you. Use Cancel to stop at any time. (Requires Edge or Chrome
installed.)`},{heading:"paste-sessions",content:`Click Paste Cookies, paste one session token per line, and click Import.
Handy for bulk-adding accounts you already have.`},{heading:"load-from-a-file",content:`Click Load from File and pick one or more .txt / .csv / .log files.
Their contents are merged into the paste box for review, then imported the same
way.`},{heading:"launching",content:`In Launch Settings, enter a Place ID and wait for the green validation
pill (it shows the resolved game name, creator and live player count), or
choose a private server.`},{heading:"launching",content:"Tick the account(s) you want in the table."},{heading:"launching",content:"Click Launch Selected."},{heading:"launching",content:`Volt launches each selected account in turn, waiting the Launch delay
(default 5s, range 0 to 120s) between each so clients don't all start at once. The
Connection column moves from Connecting to Connected as each client
attaches, and live CPU and memory fill in.`},{heading:"launching",content:"type: warn"},{heading:"launching",content:`Running more than one client at a time needs Volt's global Multi-Instance
setting enabled. If it's off, the panel prompts you with a shortcut to turn it
on.`},{heading:"launching",content:`To relaunch a single account immediately (skipping the delay), use the
circular-arrow button on its row. To close running clients, select the accounts
and click Stop.`},{heading:"auto-relaunch",content:`Enable Auto-relaunch closed instances to have Volt restart an account after
its client exits unexpectedly. A background monitor watches the tracked
processes and, after the Relaunch delay (default 5s, range 5 to 300s),
relaunches the account; the row shows a live "Relaunching in Ns…" countdown.`},{heading:"auto-relaunch",content:"type: info"},{heading:"auto-relaunch",content:`When you turn this on, Volt suggests enabling Silent Errors so crash
dialogs don't block the relaunch.`},{heading:"groups",content:`Groups let you run different sets of accounts with different settings. Each group
carries its own full launch configuration (place ID, delays, auto-relaunch,
private-server mode), so one group can target one place while another targets a
different one.`},{heading:"groups",content:"Add group, rename, or remove from the Launch Settings group dropdown."},{heading:"groups",content:`Assign accounts with the per-row group dropdown, or select several and use
Set group in the Accounts header.`},{heading:"groups",content:`The accounts table is split into sections per group (plus an Ungrouped
section) with counts.`},{heading:"private-servers",content:"Open the mode selector in Launch Settings:"},{heading:"private-servers",content:"None: launch straight into the place ID."},{heading:"private-servers",content:"Round-robin: spread launched accounts across a pool of private servers."},{heading:"private-servers",content:"Assigned: each account uses the private server assigned to it (per-row dropdown)."},{heading:"private-servers",content:`Add servers under Advanced Private Servers: give each a name, place ID, and a
private link or code. Volt resolves the link to the place at launch time and
caches the result.`},{heading:"health-checks",content:`Click Check Health (or Check on a selection) to test whether each stored
session is still valid. Every account shows an alive, dead, or
unknown badge, along with when it was last checked.`},{heading:"monitoring",content:`Header summary: totals for accounts, connected, connecting, relaunching,
total memory, total CPU, and alive/dead counts.`},{heading:"monitoring",content:`Per row: session health, Connection state (Idle / Connecting /
Connected / Relaunching), committed Memory, CPU, assigned private
server, and last-launch time.`},{heading:"monitoring",content:`Performance overlay: click Overlay for a small always-on-top window
that refreshes every few seconds with connected/total, process count, memory,
CPU and a per-account list. A corner dropdown (Top / Bottom × Left / Right)
tiles it to your screen; opening it hibernates Volt's other windows to save
resources.`},{heading:"monitoring",content:`Recent Activity: a live, timestamped log of launches, connections,
closes, relaunches, imports and errors.`},{heading:"monitoring",content:`Launch settings, groups and private servers autosave a couple of seconds
after you change them (and before every launch); per-account edits save
immediately.`},{heading:"account-data",content:"Each account stores:"},{heading:"account-data",content:"Field"},{heading:"account-data",content:"Description"},{heading:"account-data",content:"Username / Display name"},{heading:"account-data",content:"Pulled from the platform when the account is added"},{heading:"account-data",content:"Alias"},{heading:"account-data",content:"Your own nickname for the account (shown first when set)"},{heading:"account-data",content:"Group"},{heading:"account-data",content:"Which group the account belongs to"},{heading:"account-data",content:"Notes"},{heading:"account-data",content:"Free-text notes"},{heading:"account-data",content:"Session status"},{heading:"account-data",content:"alive / dead / unknown, from the last health check"},{heading:"account-data",content:"Auto-relaunch"},{heading:"account-data",content:"Whether this account is included in auto-relaunch"},{heading:"account-data",content:"Assigned private server"},{heading:"account-data",content:"Used in Assigned mode"},{heading:"account-data",content:"Last checked / Last launched"},{heading:"account-data",content:"Timestamps"},{heading:"account-data",content:"Live usage"},{heading:"account-data",content:"PID, committed memory, CPU and connection state while running"},{heading:"account-data",content:"The login session itself is stored encrypted and is never shown in the interface."},{heading:"storage-and-security",content:`Local only. Accounts, sessions, settings, groups and private servers live
in a single account-manager.json file in Volt's app-data folder. Nothing
about your accounts is sent to Volt's servers. The only network calls go
directly to the platform (to fetch identity, auth tickets and resolve places)
and to your local browser during browser login.`},{heading:"storage-and-security",content:`Encrypted at rest. On Windows, sessions are encrypted with the operating
system's data-protection API (DPAPI) and tied to your Windows user, so the file
can't be read on another machine or account. The decrypted session never
reaches the interface.`},{heading:"storage-and-security",content:`Windows-only actions. Launching, browser login, stopping/tracking clients
and live CPU all require Windows; on other platforms those actions are unavailable.`},{heading:"storage-and-security",content:`Multi-Instance. Running multiple clients depends on Volt's Multi-Instance
setting being enabled.`},{heading:"quick-start",content:`Open the Account Manager and click Login from Browser, then sign in. The
account imports automatically.`},{heading:"quick-start",content:"Enter a Place ID in Launch Settings and wait for the green pill."},{heading:"quick-start",content:"Tick the account and click Launch Selected."},{heading:"quick-start",content:`To run several at once, enable Multi-Instance when prompted, set a
Launch delay, turn on Auto-relaunch, then select all and launch.`}],headings:[{id:"opening-the-account-manager",content:"Opening the Account Manager"},{id:"adding-accounts",content:"Adding accounts"},{id:"log-in-from-a-browser-recommended",content:"Log in from a browser (recommended)"},{id:"paste-sessions",content:"Paste sessions"},{id:"load-from-a-file",content:"Load from a file"},{id:"launching",content:"Launching"},{id:"auto-relaunch",content:"Auto-relaunch"},{id:"groups",content:"Groups"},{id:"private-servers",content:"Private servers"},{id:"health-checks",content:"Health checks"},{id:"monitoring",content:"Monitoring"},{id:"account-data",content:"Account data"},{id:"storage-and-security",content:"Storage and security"},{id:"quick-start",content:"Quick start"}]};const l=[{depth:2,url:"#opening-the-account-manager",title:e.jsx(e.Fragment,{children:"Opening the Account Manager"})},{depth:2,url:"#adding-accounts",title:e.jsx(e.Fragment,{children:"Adding accounts"})},{depth:3,url:"#log-in-from-a-browser-recommended",title:e.jsx(e.Fragment,{children:"Log in from a browser (recommended)"})},{depth:3,url:"#paste-sessions",title:e.jsx(e.Fragment,{children:"Paste sessions"})},{depth:3,url:"#load-from-a-file",title:e.jsx(e.Fragment,{children:"Load from a file"})},{depth:2,url:"#launching",title:e.jsx(e.Fragment,{children:"Launching"})},{depth:2,url:"#auto-relaunch",title:e.jsx(e.Fragment,{children:"Auto-relaunch"})},{depth:2,url:"#groups",title:e.jsx(e.Fragment,{children:"Groups"})},{depth:2,url:"#private-servers",title:e.jsx(e.Fragment,{children:"Private servers"})},{depth:2,url:"#health-checks",title:e.jsx(e.Fragment,{children:"Health checks"})},{depth:2,url:"#monitoring",title:e.jsx(e.Fragment,{children:"Monitoring"})},{depth:2,url:"#account-data",title:e.jsx(e.Fragment,{children:"Account data"})},{depth:2,url:"#storage-and-security",title:e.jsx(e.Fragment,{children:"Storage and security"})},{depth:2,url:"#quick-start",title:e.jsx(e.Fragment,{children:"Quick start"})}];function a(t){const n={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components},{Callout:o}=n;return o||s("Callout"),e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"Account Manager"}),` is a built-in panel for storing multiple accounts and
launching the game with any of them, without signing in by hand every time. Each
account is added once by capturing its login session, which Volt stores `,e.jsx(n.strong,{children:`locally
and encrypted`}),`. From there you can launch one or many accounts at once, point
them at a specific place or private server, automatically restart crashed
instances, watch each instance's live CPU, memory and connection status, and
organize everything into groups.`]}),`
`,e.jsx(o,{type:"info",children:e.jsxs(n.p,{children:["Launching, browser login and live process stats are ",e.jsx(n.strong,{children:"Windows-only"}),`. Your
accounts never leave your machine. See `,e.jsx(n.a,{href:"#storage-and-security",children:`Storage and
security`}),"."]})}),`
`,e.jsx(n.h2,{id:"opening-the-account-manager",children:"Opening the Account Manager"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Activity bar"}),": click the ",e.jsx(n.strong,{children:"Account Manager"})," item (people icon) on the side rail."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Command palette"}),": search for ",e.jsx(n.strong,{children:'"Account Manager: Open"'}),"."]}),`
`,e.jsxs(n.li,{children:["Keep it docked in the main window, or use ",e.jsx(n.strong,{children:"Dock / Overlay"}),` to pop it out into
its own window or a compact always-on-top monitor.`]}),`
`]}),`
`,e.jsx(n.h2,{id:"adding-accounts",children:"Adding accounts"}),`
`,e.jsxs(n.p,{children:[`There are three ways to add accounts. However you add them, Volt fetches each
account's identity (username and display name), confirms the session is valid,
then encrypts and stores it. Accounts are de-duplicated automatically, so
re-adding an existing one simply updates it. After importing, a summary reports
how many accounts were `,e.jsx(n.strong,{children:"imported"}),", ",e.jsx(n.strong,{children:"updated"}),", and ",e.jsx(n.strong,{children:"failed"}),` (with a reason
for each failure).`]}),`
`,e.jsx(n.h3,{id:"log-in-from-a-browser-recommended",children:"Log in from a browser (recommended)"}),`
`,e.jsxs(n.p,{children:["Click ",e.jsx(n.strong,{children:"Login from Browser"}),`. Volt opens Microsoft Edge or Google Chrome in a
throwaway profile on the platform's login page. Sign in as you normally would.
Volt detects the session automatically, imports the account, and closes the
browser for you. Use `,e.jsx(n.strong,{children:"Cancel"}),` to stop at any time. (Requires Edge or Chrome
installed.)`]}),`
`,e.jsx(n.h3,{id:"paste-sessions",children:"Paste sessions"}),`
`,e.jsxs(n.p,{children:["Click ",e.jsx(n.strong,{children:"Paste Cookies"}),", paste one session token per line, and click ",e.jsx(n.strong,{children:"Import"}),`.
Handy for bulk-adding accounts you already have.`]}),`
`,e.jsx(n.h3,{id:"load-from-a-file",children:"Load from a file"}),`
`,e.jsxs(n.p,{children:["Click ",e.jsx(n.strong,{children:"Load from File"})," and pick one or more ",e.jsx(n.code,{children:".txt"})," / ",e.jsx(n.code,{children:".csv"})," / ",e.jsx(n.code,{children:".log"}),` files.
Their contents are merged into the paste box for review, then imported the same
way.`]}),`
`,e.jsx(n.h2,{id:"launching",children:"Launching"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["In ",e.jsx(n.strong,{children:"Launch Settings"}),", enter a ",e.jsx(n.strong,{children:"Place ID"}),` and wait for the green validation
pill (it shows the resolved game name, creator and live player count), or
choose a `,e.jsx(n.a,{href:"#private-servers",children:"private server"}),"."]}),`
`,e.jsx(n.li,{children:"Tick the account(s) you want in the table."}),`
`,e.jsxs(n.li,{children:["Click ",e.jsx(n.strong,{children:"Launch Selected"}),"."]}),`
`]}),`
`,e.jsxs(n.p,{children:["Volt launches each selected account in turn, waiting the ",e.jsx(n.strong,{children:"Launch delay"}),`
(default 5s, range 0 to 120s) between each so clients don't all start at once. The
`,e.jsx(n.strong,{children:"Connection"})," column moves from ",e.jsx(n.em,{children:"Connecting"})," to ",e.jsx(n.em,{children:"Connected"}),` as each client
attaches, and live CPU and memory fill in.`]}),`
`,e.jsx(o,{type:"warn",children:e.jsxs(n.p,{children:["Running more than one client at a time needs Volt's global ",e.jsx(n.strong,{children:"Multi-Instance"}),`
setting enabled. If it's off, the panel prompts you with a shortcut to turn it
on.`]})}),`
`,e.jsxs(n.p,{children:[`To relaunch a single account immediately (skipping the delay), use the
circular-arrow button on its row. To close running clients, select the accounts
and click `,e.jsx(n.strong,{children:"Stop"}),"."]}),`
`,e.jsx(n.h2,{id:"auto-relaunch",children:"Auto-relaunch"}),`
`,e.jsxs(n.p,{children:["Enable ",e.jsx(n.strong,{children:"Auto-relaunch closed instances"}),` to have Volt restart an account after
its client exits unexpectedly. A background monitor watches the tracked
processes and, after the `,e.jsx(n.strong,{children:"Relaunch delay"}),` (default 5s, range 5 to 300s),
relaunches the account; the row shows a live "Relaunching in Ns…" countdown.`]}),`
`,e.jsx(o,{type:"info",children:e.jsxs(n.p,{children:["When you turn this on, Volt suggests enabling ",e.jsx(n.strong,{children:"Silent Errors"}),` so crash
dialogs don't block the relaunch.`]})}),`
`,e.jsx(n.h2,{id:"groups",children:"Groups"}),`
`,e.jsxs(n.p,{children:[`Groups let you run different sets of accounts with different settings. Each group
carries its `,e.jsx(n.strong,{children:"own"}),` full launch configuration (place ID, delays, auto-relaunch,
private-server mode), so one group can target one place while another targets a
different one.`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Add group"}),", ",e.jsx(n.strong,{children:"rename"}),", or ",e.jsx(n.strong,{children:"remove"})," from the ",e.jsx(n.strong,{children:"Launch Settings"})," group dropdown."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Assign accounts"}),` with the per-row group dropdown, or select several and use
`,e.jsx(n.strong,{children:"Set group"})," in the Accounts header."]}),`
`]}),`
`,e.jsxs(n.p,{children:["The accounts table is split into sections per group (plus an ",e.jsx(n.em,{children:"Ungrouped"}),`
section) with counts.`]}),`
`,e.jsx(n.h2,{id:"private-servers",children:"Private servers"}),`
`,e.jsxs(n.p,{children:["Open the ",e.jsx(n.strong,{children:"mode selector"})," in Launch Settings:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"None"}),": launch straight into the place ID."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Round-robin"}),": spread launched accounts across a pool of private servers."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Assigned"}),": each account uses the private server assigned to it (per-row dropdown)."]}),`
`]}),`
`,e.jsxs(n.p,{children:["Add servers under ",e.jsx(n.strong,{children:"Advanced Private Servers"}),`: give each a name, place ID, and a
private link or code. Volt resolves the link to the place at launch time and
caches the result.`]}),`
`,e.jsx(n.h2,{id:"health-checks",children:"Health checks"}),`
`,e.jsxs(n.p,{children:["Click ",e.jsx(n.strong,{children:"Check Health"})," (or ",e.jsx(n.strong,{children:"Check"}),` on a selection) to test whether each stored
session is still valid. Every account shows an `,e.jsx(n.strong,{children:"alive"}),", ",e.jsx(n.strong,{children:"dead"}),`, or
`,e.jsx(n.strong,{children:"unknown"})," badge, along with when it was last checked."]}),`
`,e.jsx(n.h2,{id:"monitoring",children:"Monitoring"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Header summary"}),`: totals for accounts, connected, connecting, relaunching,
total memory, total CPU, and alive/dead counts.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Per row"}),": session health, ",e.jsx(n.strong,{children:"Connection"}),` state (Idle / Connecting /
Connected / Relaunching), committed `,e.jsx(n.strong,{children:"Memory"}),", ",e.jsx(n.strong,{children:"CPU"}),`, assigned private
server, and last-launch time.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Performance overlay"}),": click ",e.jsx(n.strong,{children:"Overlay"}),` for a small always-on-top window
that refreshes every few seconds with connected/total, process count, memory,
CPU and a per-account list. A corner dropdown (Top / Bottom × Left / Right)
tiles it to your screen; opening it hibernates Volt's other windows to save
resources.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Recent Activity"}),`: a live, timestamped log of launches, connections,
closes, relaunches, imports and errors.`]}),`
`]}),`
`,e.jsxs(n.p,{children:["Launch settings, groups and private servers ",e.jsx(n.strong,{children:"autosave"}),` a couple of seconds
after you change them (and before every launch); per-account edits save
immediately.`]}),`
`,e.jsx(n.h2,{id:"account-data",children:"Account data"}),`
`,e.jsx(n.p,{children:"Each account stores:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Field"}),e.jsx(n.th,{children:"Description"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Username / Display name"}),e.jsx(n.td,{children:"Pulled from the platform when the account is added"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Alias"}),e.jsx(n.td,{children:"Your own nickname for the account (shown first when set)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Group"}),e.jsx(n.td,{children:"Which group the account belongs to"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Notes"}),e.jsx(n.td,{children:"Free-text notes"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Session status"}),e.jsxs(n.td,{children:[e.jsx(n.code,{children:"alive"})," / ",e.jsx(n.code,{children:"dead"})," / ",e.jsx(n.code,{children:"unknown"}),", from the last health check"]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Auto-relaunch"}),e.jsx(n.td,{children:"Whether this account is included in auto-relaunch"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Assigned private server"}),e.jsxs(n.td,{children:["Used in ",e.jsx(n.em,{children:"Assigned"})," mode"]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Last checked / Last launched"}),e.jsx(n.td,{children:"Timestamps"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Live usage"}),e.jsx(n.td,{children:"PID, committed memory, CPU and connection state while running"})]})]})]}),`
`,e.jsxs(n.p,{children:["The login session itself is stored ",e.jsx(n.strong,{children:"encrypted"})," and is never shown in the interface."]}),`
`,e.jsx(n.h2,{id:"storage-and-security",children:"Storage and security"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Local only."}),` Accounts, sessions, settings, groups and private servers live
in a single `,e.jsx(n.code,{children:"account-manager.json"}),` file in Volt's app-data folder. Nothing
about your accounts is sent to Volt's servers. The only network calls go
directly to the platform (to fetch identity, auth tickets and resolve places)
and to your local browser during browser login.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Encrypted at rest."}),` On Windows, sessions are encrypted with the operating
system's data-protection API (DPAPI) and tied to your Windows user, so the file
can't be read on another machine or account. The decrypted session never
reaches the interface.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Windows-only actions."}),` Launching, browser login, stopping/tracking clients
and live CPU all require Windows; on other platforms those actions are unavailable.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Multi-Instance."}),` Running multiple clients depends on Volt's Multi-Instance
setting being enabled.`]}),`
`]}),`
`,e.jsx(n.h2,{id:"quick-start",children:"Quick start"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Open the Account Manager and click ",e.jsx(n.strong,{children:"Login from Browser"}),`, then sign in. The
account imports automatically.`]}),`
`,e.jsxs(n.li,{children:["Enter a ",e.jsx(n.strong,{children:"Place ID"})," in Launch Settings and wait for the green pill."]}),`
`,e.jsxs(n.li,{children:["Tick the account and click ",e.jsx(n.strong,{children:"Launch Selected"}),"."]}),`
`,e.jsxs(n.li,{children:["To run several at once, enable ",e.jsx(n.strong,{children:"Multi-Instance"}),` when prompted, set a
`,e.jsx(n.strong,{children:"Launch delay"}),", turn on ",e.jsx(n.strong,{children:"Auto-relaunch"}),", then select all and launch."]}),`
`]})]})}function d(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(a,{...t})}):a(t)}function s(t,n){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}export{d as default,i as frontmatter,c as structuredData,l as toc};
