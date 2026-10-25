import{j as e}from"./main-DJXeaSrE.js";let l={title:"Volt 1.3",description:"Volt 1.3 adds UI 1.0, Account Manager, Game Explorer, Script Viewer, Save Instance, and the Luau decompiler.",icon:"BadgeCheck"},h={contents:[{heading:void 0,content:`Volt 1.3 adds tools for inspecting games, viewing and decompiling scripts,
saving instances, and managing account launches. It also includes executor API
updates and UI 1.0.`},{heading:void 0,content:"Component"},{heading:void 0,content:"Version"},{heading:void 0,content:"Module"},{heading:void 0,content:"1.3.0.0"},{heading:void 0,content:"UI"},{heading:void 0,content:"1.0.0"},{heading:"executor",content:`This release fixes various executor bugs and introduces new behavior across the
runtime and API. Luau LSP types were also updated.`},{heading:"runtime-and-api-updates",content:`Fixed issues affecting hookfunction,
oth.hook, RakNet packet hooks, auto-execution, workspace
folder creation, and keyboard paste input.`},{heading:"runtime-and-api-updates",content:`Fixed setfenv interactions with
setstackhidden and oth hooks.`},{heading:"runtime-and-api-updates",content:`gethiddenproperty,
gethiddenproperties,
sethiddenproperty,
getproperties,
isscriptable,
setscriptable, and
getcallbackvalue now accept Object
instead of only Instance.`},{heading:"runtime-and-api-updates",content:`getconnections now works with
non-scriptable signals.`},{heading:"runtime-and-api-updates",content:`getscriptbytecode,
getscriptclosure, and
getscripthash now support CoreScripts.`},{heading:"runtime-and-api-updates",content:"Added raknet.is_enabled(): boolean."},{heading:"runtime-and-api-updates",content:`Added setrbxclipboard(data: any)
for copying Studio-compatible data.`},{heading:"runtime-and-api-updates",content:`Added saveinstance and
saveplace.`},{heading:"internal-ui",content:`Volt 1.3 adds Game Explorer and Script Viewer to the internal UI. It also uses
themes from the desktop interface for consistent styling.`},{heading:"game-explorer",content:`Game Explorer shows the live game tree and a properties panel for viewing and
editing the selected instances.`},{heading:"game-explorer",content:"Hold CTRL to select multiple instances."},{heading:"game-explorer",content:"Use the instance context menu to copy, rename, or paste into an instance."},{heading:"game-explorer",content:"Use Copy Path to copy a Luau path for a property."},{heading:"game-explorer",content:"Use Copy Name to copy only the property name."},{heading:"game-explorer",content:"Use Copy Value to copy the value in Luau format."},{heading:"game-explorer",content:"Tags and attributes can be removed from their context menus."},{heading:"game-explorer",content:"Save Place displays progress while the place is being written."},{heading:"script-viewer",content:`Script Viewer displays decompiled script output with variable renaming,
reference navigation, and bracket pair colorization.`},{heading:"script-viewer",content:"Right-click a variable or press X to view its references."},{heading:"script-viewer",content:"Press R to rename the selected variable."},{heading:"decompiler",content:`Volt 1.3 introduces a built-in Luau decompiler. decompile
accepts a script or raw Luau bytecode and returns source text.`},{heading:"decompiler",content:`DecompilerOptions controls
variable naming, function declarations, guard clauses, conditional
structuring, constant folding, scope block insertion, and formatting.`},{heading:"decompiler",content:`DecompilerFormatter controls
indentation, column limit, condition parentheses, semicolons, and function
metadata.`},{heading:"decompiler",content:"type: warn"},{heading:"decompiler",content:`The decompiler is still in development, so some bugs are expected. See the
Decompiler guide for usage details and current behavior.`},{heading:"save-instance",content:`saveinstance and
saveplace export instance hierarchies using
the game's binary serialization format. They can run from scripts or from the
internal UI.`},{heading:"save-instance",content:`Use SaveInstanceOptions
to configure:`},{heading:"save-instance",content:"Output file path"},{heading:"save-instance",content:"Script decompilation"},{heading:"save-instance",content:"Clipboard output"},{heading:"save-instance",content:"An IgnoreList property (currently readable, but not assignable from Luau)"},{heading:"save-instance",content:"Decompiler options"},{heading:"save-instance",content:"Player and character filters"},{heading:"save-instance",content:"Nil instance filters"},{heading:"save-instance",content:"Non-creatable instance filters"},{heading:"desktop-ui-10",content:`UI 1.0 introduces a redesigned desktop interface with a more compact layout,
refreshed branding, updated app icons, and a cleaner default theme.`},{heading:"desktop-ui-10",content:"Home and setup view"},{heading:"desktop-ui-10",content:"Editor view"},{heading:"workspace",content:"Pinned tabs, with Home pinned by default, and dedicated pinned-tab controls."},{heading:"workspace",content:`Saved layouts that restore splits, open tabs, pane sizes, sidebar and terminal
state, window placement, and unsaved tabs.`},{heading:"workspace",content:`Detachable Terminals, Account Manager, and Theme Editor windows. Terminals
include search and filtering, connection status, and topmost mode.`},{heading:"workspace",content:`Instance groups, including an All group, with support for binding tabs to a
group.`},{heading:"workspace",content:"A searchable command palette for common actions."},{heading:"editor-and-files",content:"Editor breadcrumbs with folder and file navigation."},{heading:"editor-and-files",content:"Separate Scripts and Autoexec trees with search and folder creation."},{heading:"editor-and-files",content:`Drag-and-drop file organization and support for opening external .txt,
.lua, and .luau files.`},{heading:"editor-and-files",content:"Installed system font detection and font selection in Settings."},{heading:"editor-and-files",content:`Dynamic source maps that keep Luau LSP completions and types synchronized
with the live game tree.`},{heading:"setup-and-settings",content:`One-click setup from Home, supported game version checks, and prompts to
install the required version when needed.`},{heading:"setup-and-settings",content:"Background Volt update checks and an API health check during startup."},{heading:"setup-and-settings",content:`Decompiler settings with live output previews and Save Instance default
settings.`},{heading:"setup-and-settings",content:"Theme schema v3 with expanded customization and theme import and export."},{heading:"setup-and-settings",content:`Windows 7 Aero, Volt Ware, and Voltmillion themes, with updated built-in
Monaco styling.`},{heading:"setup-and-settings",content:`A Theme Editor with collapsible sections and a responsive color picker, plus
a keybind editor for the internal UI.`},{heading:"account-manager",content:`Volt 1.3 introduces Account Manager as a public feature. It stores accounts,
launches multiple clients, tracks running instances, and manages private server
launches.`},{heading:"account-manager",content:"Launch settings and account table"},{heading:"account-manager",content:"Performance overlay"},{heading:"account-manager",content:"It includes:"},{heading:"account-manager",content:`Browser login and bulk cookie import, with protected cookie storage and
cookie health checks.`},{heading:"account-manager",content:`Multi-account launching with launch delays, stop controls, connection
tracking, and Place ID validation.`},{heading:"account-manager",content:"Private server launching with none, round-robin, and assigned server modes."},{heading:"account-manager",content:"Automatic relaunching for closed instances, with relaunch countdowns."},{heading:"account-manager",content:"Per-account and total CPU and memory usage."},{heading:"account-manager",content:`A configurable performance overlay showing account status, process count,
CPU and memory usage, and relaunch state.`},{heading:"account-manager",content:"Memory Guard with automatic and fixed committed-memory limits."},{heading:"account-manager",content:"Autosaved launch and private server settings."},{heading:"related-docs",content:"Decompiler"},{heading:"related-docs",content:"Save Instance"},{heading:"related-docs",content:"Account Manager"}],headings:[{id:"executor",content:"Executor"},{id:"runtime-and-api-updates",content:"Runtime and API updates"},{id:"internal-ui",content:"Internal UI"},{id:"game-explorer",content:"Game Explorer"},{id:"script-viewer",content:"Script Viewer"},{id:"decompiler",content:"Decompiler"},{id:"save-instance",content:"Save Instance"},{id:"desktop-ui-10",content:"Desktop UI 1.0"},{id:"workspace",content:"Workspace"},{id:"editor-and-files",content:"Editor and files"},{id:"setup-and-settings",content:"Setup and settings"},{id:"account-manager",content:"Account Manager"},{id:"related-docs",content:"Related docs"}]};const p=[{depth:2,url:"#executor",title:e.jsx(e.Fragment,{children:"Executor"})},{depth:3,url:"#runtime-and-api-updates",title:e.jsx(e.Fragment,{children:"Runtime and API updates"})},{depth:2,url:"#internal-ui",title:e.jsx(e.Fragment,{children:"Internal UI"})},{depth:3,url:"#game-explorer",title:e.jsx(e.Fragment,{children:"Game Explorer"})},{depth:3,url:"#script-viewer",title:e.jsx(e.Fragment,{children:"Script Viewer"})},{depth:2,url:"#decompiler",title:e.jsx(e.Fragment,{children:"Decompiler"})},{depth:2,url:"#save-instance",title:e.jsx(e.Fragment,{children:"Save Instance"})},{depth:2,url:"#desktop-ui-10",title:e.jsx(e.Fragment,{children:"Desktop UI 1.0"})},{depth:3,url:"#workspace",title:e.jsx(e.Fragment,{children:"Workspace"})},{depth:3,url:"#editor-and-files",title:e.jsx(e.Fragment,{children:"Editor and files"})},{depth:3,url:"#setup-and-settings",title:e.jsx(e.Fragment,{children:"Setup and settings"})},{depth:2,url:"#account-manager",title:e.jsx(e.Fragment,{children:"Account Manager"})},{depth:2,url:"#related-docs",title:e.jsx(e.Fragment,{children:"Related docs"})}];function c(t){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components},{Callout:s,ImageZoom:i,Tab:a,Tabs:o}=n;return s||r("Callout"),i||r("ImageZoom"),a||r("Tab"),o||r("Tabs"),e.jsxs(e.Fragment,{children:[e.jsx(n.p,{children:`Volt 1.3 adds tools for inspecting games, viewing and decompiling scripts,
saving instances, and managing account launches. It also includes executor API
updates and UI 1.0.`}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Component"}),e.jsx(n.th,{children:"Version"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Module"}),e.jsx(n.td,{children:e.jsx(n.code,{children:"1.3.0.0"})})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"UI"}),e.jsx(n.td,{children:e.jsx(n.code,{children:"1.0.0"})})]})]})]}),`
`,e.jsx(n.h2,{id:"executor",children:"Executor"}),`
`,e.jsx(n.p,{children:`This release fixes various executor bugs and introduces new behavior across the
runtime and API. Luau LSP types were also updated.`}),`
`,e.jsx(n.h3,{id:"runtime-and-api-updates",children:"Runtime and API updates"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Fixed issues affecting ",e.jsx(n.a,{href:"/docs/closures/hookfunction",children:e.jsx(n.code,{children:"hookfunction"})}),`,
`,e.jsx(n.a,{href:"/docs/oth/hook",children:e.jsx(n.code,{children:"oth.hook"})}),`, RakNet packet hooks, auto-execution, workspace
folder creation, and keyboard paste input.`]}),`
`,e.jsxs(n.li,{children:["Fixed ",e.jsx(n.code,{children:"setfenv"}),` interactions with
`,e.jsx(n.a,{href:"/docs/closures/setstackhidden",children:e.jsx(n.code,{children:"setstackhidden"})})," and ",e.jsx(n.code,{children:"oth"})," hooks."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/reflection/gethiddenproperty",children:e.jsx(n.code,{children:"gethiddenproperty"})}),`,
`,e.jsx(n.a,{href:"/docs/reflection/gethiddenproperties",children:e.jsx(n.code,{children:"gethiddenproperties"})}),`,
`,e.jsx(n.a,{href:"/docs/reflection/sethiddenproperty",children:e.jsx(n.code,{children:"sethiddenproperty"})}),`,
`,e.jsx(n.a,{href:"/docs/reflection/getproperties",children:e.jsx(n.code,{children:"getproperties"})}),`,
`,e.jsx(n.a,{href:"/docs/reflection/isscriptable",children:e.jsx(n.code,{children:"isscriptable"})}),`,
`,e.jsx(n.a,{href:"/docs/reflection/setscriptable",children:e.jsx(n.code,{children:"setscriptable"})}),`, and
`,e.jsx(n.a,{href:"/docs/instances/getcallbackvalue",children:e.jsx(n.code,{children:"getcallbackvalue"})})," now accept ",e.jsx(n.code,{children:"Object"}),`
instead of only `,e.jsx(n.code,{children:"Instance"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/signals/getconnections",children:e.jsx(n.code,{children:"getconnections"})}),` now works with
non-scriptable signals.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/scripts/getscriptbytecode",children:e.jsx(n.code,{children:"getscriptbytecode"})}),`,
`,e.jsx(n.a,{href:"/docs/scripts/getscriptclosure",children:e.jsx(n.code,{children:"getscriptclosure"})}),`, and
`,e.jsx(n.a,{href:"/docs/scripts/getscripthash",children:e.jsx(n.code,{children:"getscripthash"})})," now support CoreScripts."]}),`
`,e.jsxs(n.li,{children:["Added ",e.jsx(n.a,{href:"/docs/raknet",children:e.jsx(n.code,{children:"raknet.is_enabled(): boolean"})}),"."]}),`
`,e.jsxs(n.li,{children:["Added ",e.jsx(n.a,{href:"/docs/miscellaneous/setrbxclipboard",children:e.jsx(n.code,{children:"setrbxclipboard(data: any)"})}),`
for copying Studio-compatible data.`]}),`
`,e.jsxs(n.li,{children:["Added ",e.jsx(n.a,{href:"/docs/miscellaneous/saveinstance",children:e.jsx(n.code,{children:"saveinstance"})}),` and
`,e.jsx(n.a,{href:"/docs/miscellaneous/saveplace",children:e.jsx(n.code,{children:"saveplace"})}),"."]}),`
`]}),`
`,e.jsx(n.h2,{id:"internal-ui",children:"Internal UI"}),`
`,e.jsx(n.p,{children:`Volt 1.3 adds Game Explorer and Script Viewer to the internal UI. It also uses
themes from the desktop interface for consistent styling.`}),`
`,e.jsxs(o,{items:["Volt Dark","Catppuccin Mocha","Sakura Drift"],children:[e.jsx(a,{children:e.jsx("figure",{className:"m-0 overflow-hidden",children:e.jsx(i,{src:"/img/internal-ui-volt-dark.png",alt:"Volt internal UI using the Volt Dark theme",loading:"lazy",className:"block w-full cursor-zoom-in"})})}),e.jsx(a,{children:e.jsx("figure",{className:"m-0 overflow-hidden",children:e.jsx(i,{src:"/img/internal-ui-catppuccin-mocha.png",alt:"Volt internal UI using the Catppuccin Mocha theme",loading:"lazy",className:"block w-full cursor-zoom-in"})})}),e.jsx(a,{children:e.jsx("figure",{className:"m-0 overflow-hidden",children:e.jsx(i,{src:"/img/internal-ui-sakura-drift.png",alt:"Volt internal UI using the Sakura Drift theme",loading:"lazy",className:"block w-full cursor-zoom-in"})})})]}),`
`,e.jsx(n.h3,{id:"game-explorer",children:"Game Explorer"}),`
`,e.jsx(n.p,{children:`Game Explorer shows the live game tree and a properties panel for viewing and
editing the selected instances.`}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Hold ",e.jsx(n.code,{children:"CTRL"})," to select multiple instances."]}),`
`,e.jsx(n.li,{children:"Use the instance context menu to copy, rename, or paste into an instance."}),`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.strong,{children:"Copy Path"})," to copy a Luau path for a property."]}),`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.strong,{children:"Copy Name"})," to copy only the property name."]}),`
`,e.jsxs(n.li,{children:["Use ",e.jsx(n.strong,{children:"Copy Value"})," to copy the value in Luau format."]}),`
`,e.jsx(n.li,{children:"Tags and attributes can be removed from their context menus."}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Save Place"})," displays progress while the place is being written."]}),`
`]}),`
`,e.jsx(n.h3,{id:"script-viewer",children:"Script Viewer"}),`
`,e.jsx(n.p,{children:`Script Viewer displays decompiled script output with variable renaming,
reference navigation, and bracket pair colorization.`}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Right-click a variable or press ",e.jsx(n.code,{children:"X"})," to view its references."]}),`
`,e.jsxs(n.li,{children:["Press ",e.jsx(n.code,{children:"R"})," to rename the selected variable."]}),`
`]}),`
`,e.jsx(n.h2,{id:"decompiler",children:"Decompiler"}),`
`,e.jsxs(n.p,{children:["Volt 1.3 introduces a built-in Luau decompiler. ",e.jsx(n.a,{href:"/docs/scripts/decompile",children:e.jsx(n.code,{children:"decompile"})}),`
accepts a script or raw Luau bytecode and returns source text.`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/scripts/decompile#decompileroptions",children:e.jsx(n.code,{children:"DecompilerOptions"})}),` controls
variable naming, function declarations, guard clauses, conditional
structuring, constant folding, scope block insertion, and formatting.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"/docs/scripts/decompile#decompilerformatter",children:e.jsx(n.code,{children:"DecompilerFormatter"})}),` controls
indentation, column limit, condition parentheses, semicolons, and function
metadata.`]}),`
`]}),`
`,e.jsx(s,{type:"warn",children:e.jsxs(n.p,{children:[`The decompiler is still in development, so some bugs are expected. See the
`,e.jsx(n.a,{href:"/docs/decompiler",children:"Decompiler guide"})," for usage details and current behavior."]})}),`
`,e.jsx(n.h2,{id:"save-instance",children:"Save Instance"}),`
`,e.jsxs(n.p,{children:[e.jsx(n.a,{href:"/docs/miscellaneous/saveinstance",children:e.jsx(n.code,{children:"saveinstance"})}),` and
`,e.jsx(n.a,{href:"/docs/miscellaneous/saveplace",children:e.jsx(n.code,{children:"saveplace"})}),` export instance hierarchies using
the game's binary serialization format. They can run from scripts or from the
internal UI.`]}),`
`,e.jsxs(n.p,{children:["Use ",e.jsx(n.a,{href:"/docs/miscellaneous/saveinstance#saveinstanceoptions",children:e.jsx(n.code,{children:"SaveInstanceOptions"})}),`
to configure:`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Output file path"}),`
`,e.jsx(n.li,{children:"Script decompilation"}),`
`,e.jsx(n.li,{children:"Clipboard output"}),`
`,e.jsxs(n.li,{children:["An ",e.jsx(n.code,{children:"IgnoreList"})," property (currently readable, but not assignable from Luau)"]}),`
`,e.jsx(n.li,{children:"Decompiler options"}),`
`,e.jsx(n.li,{children:"Player and character filters"}),`
`,e.jsx(n.li,{children:"Nil instance filters"}),`
`,e.jsx(n.li,{children:"Non-creatable instance filters"}),`
`]}),`
`,e.jsx(n.h2,{id:"desktop-ui-10",children:"Desktop UI 1.0"}),`
`,e.jsx(n.p,{children:`UI 1.0 introduces a redesigned desktop interface with a more compact layout,
refreshed branding, updated app icons, and a cleaner default theme.`}),`
`,e.jsxs("div",{className:"not-prose my-5 grid gap-3 sm:grid-cols-2",children:[e.jsxs("figure",{className:"m-0 overflow-hidden rounded-lg border border-fd-border bg-fd-card",children:[e.jsx(i,{src:"/img/home.png",alt:"Volt UI 1.0 home and setup screen",loading:"lazy",className:"block w-full cursor-zoom-in"}),e.jsx("figcaption",{className:"border-t border-fd-border px-3 py-2 text-xs text-fd-muted-foreground",children:e.jsx(n.p,{children:"Home and setup view"})})]}),e.jsxs("figure",{className:"m-0 overflow-hidden rounded-lg border border-fd-border bg-fd-card",children:[e.jsx(i,{src:"/img/editor.png",alt:"Volt UI 1.0 editor screen",loading:"lazy",className:"block w-full cursor-zoom-in"}),e.jsx("figcaption",{className:"border-t border-fd-border px-3 py-2 text-xs text-fd-muted-foreground",children:e.jsx(n.p,{children:"Editor view"})})]})]}),`
`,e.jsx(n.h3,{id:"workspace",children:"Workspace"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Pinned tabs, with Home pinned by default, and dedicated pinned-tab controls."}),`
`,e.jsx(n.li,{children:`Saved layouts that restore splits, open tabs, pane sizes, sidebar and terminal
state, window placement, and unsaved tabs.`}),`
`,e.jsx(n.li,{children:`Detachable Terminals, Account Manager, and Theme Editor windows. Terminals
include search and filtering, connection status, and topmost mode.`}),`
`,e.jsxs(n.li,{children:["Instance groups, including an ",e.jsx(n.code,{children:"All"}),` group, with support for binding tabs to a
group.`]}),`
`,e.jsx(n.li,{children:"A searchable command palette for common actions."}),`
`]}),`
`,e.jsx(n.h3,{id:"editor-and-files",children:"Editor and files"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Editor breadcrumbs with folder and file navigation."}),`
`,e.jsx(n.li,{children:"Separate Scripts and Autoexec trees with search and folder creation."}),`
`,e.jsxs(n.li,{children:["Drag-and-drop file organization and support for opening external ",e.jsx(n.code,{children:".txt"}),`,
`,e.jsx(n.code,{children:".lua"}),", and ",e.jsx(n.code,{children:".luau"})," files."]}),`
`,e.jsx(n.li,{children:"Installed system font detection and font selection in Settings."}),`
`,e.jsx(n.li,{children:`Dynamic source maps that keep Luau LSP completions and types synchronized
with the live game tree.`}),`
`]}),`
`,e.jsx(n.h3,{id:"setup-and-settings",children:"Setup and settings"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:`One-click setup from Home, supported game version checks, and prompts to
install the required version when needed.`}),`
`,e.jsx(n.li,{children:"Background Volt update checks and an API health check during startup."}),`
`,e.jsx(n.li,{children:`Decompiler settings with live output previews and Save Instance default
settings.`}),`
`,e.jsx(n.li,{children:"Theme schema v3 with expanded customization and theme import and export."}),`
`,e.jsx(n.li,{children:`Windows 7 Aero, Volt Ware, and Voltmillion themes, with updated built-in
Monaco styling.`}),`
`,e.jsx(n.li,{children:`A Theme Editor with collapsible sections and a responsive color picker, plus
a keybind editor for the internal UI.`}),`
`]}),`
`,e.jsx(n.h2,{id:"account-manager",children:"Account Manager"}),`
`,e.jsx(n.p,{children:`Volt 1.3 introduces Account Manager as a public feature. It stores accounts,
launches multiple clients, tracks running instances, and manages private server
launches.`}),`
`,e.jsxs("div",{className:"not-prose my-5 grid gap-3 sm:grid-cols-2",children:[e.jsxs("figure",{className:"m-0 overflow-hidden rounded-lg border border-fd-border bg-fd-card",children:[e.jsx(i,{src:"/img/account_manager_1.png",alt:"Volt Account Manager launch settings and account table",loading:"lazy",className:"block w-full cursor-zoom-in"}),e.jsx("figcaption",{className:"border-t border-fd-border px-3 py-2 text-xs text-fd-muted-foreground",children:e.jsx(n.p,{children:"Launch settings and account table"})})]}),e.jsxs("figure",{className:"m-0 overflow-hidden rounded-lg border border-fd-border bg-fd-card",children:[e.jsx("div",{className:"flex h-full min-h-48 items-center justify-center p-4",children:e.jsx(i,{src:"/img/overlay_1.png",alt:"Volt Account Manager compact performance overlay",loading:"lazy",className:"block max-h-64 w-auto max-w-full cursor-zoom-in"})}),e.jsx("figcaption",{className:"border-t border-fd-border px-3 py-2 text-xs text-fd-muted-foreground",children:e.jsx(n.p,{children:"Performance overlay"})})]})]}),`
`,e.jsx(n.p,{children:"It includes:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:`Browser login and bulk cookie import, with protected cookie storage and
cookie health checks.`}),`
`,e.jsx(n.li,{children:`Multi-account launching with launch delays, stop controls, connection
tracking, and Place ID validation.`}),`
`,e.jsx(n.li,{children:"Private server launching with none, round-robin, and assigned server modes."}),`
`,e.jsx(n.li,{children:"Automatic relaunching for closed instances, with relaunch countdowns."}),`
`,e.jsx(n.li,{children:"Per-account and total CPU and memory usage."}),`
`,e.jsx(n.li,{children:`A configurable performance overlay showing account status, process count,
CPU and memory usage, and relaunch state.`}),`
`,e.jsx(n.li,{children:"Memory Guard with automatic and fixed committed-memory limits."}),`
`,e.jsx(n.li,{children:"Autosaved launch and private server settings."}),`
`]}),`
`,e.jsx(n.h2,{id:"related-docs",children:"Related docs"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs/decompiler",children:"Decompiler"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs/miscellaneous/saveinstance",children:"Save Instance"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"/docs/account-manager",children:"Account Manager"})}),`
`]})]})}function u(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(c,{...t})}):c(t)}function r(t,n){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}export{u as default,l as frontmatter,h as structuredData,p as toc};
