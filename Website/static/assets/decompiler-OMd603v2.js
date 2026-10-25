import{j as e}from"./main-DJXeaSrE.js";let a={title:"Decompiler",icon:"SearchCode"},l={contents:[{heading:void 0,content:"Volt's decompiler turns Luau bytecode back into readable Luau source. The most important thing to know as a user is that decompilation runs asynchronously: calls that need source can yield while the decompiler works in the background, then resume when the result is ready."},{heading:void 0,content:"That behavior matters most for saves, where one operation may need source for many scripts before the final file can be written."},{heading:"how-it-works",content:"The decompiler work is scheduled as jobs. The Luau-facing operation yields while those jobs run, so long decompiles do not block the calling script thread."},{heading:"how-it-works",content:"The decompiler scheduler will configure itself automatically based on the number of available CPU cores. When these threads are not used, they are in a dormant state and don't utilize any CPU time."},{heading:"how-it-works",content:"decompile schedules one script and yields until the source is ready. saveinstance and saveplace can schedule many scripts during a save, wait for the results, then finish writing the final place or model file."},{heading:"the-pipeline",content:"This section explains how Volt's decompiler pipeline works, how each option changes the output, and what those choices mean for performance."},{heading:"the-pipeline",content:"Volt prioritizes semantic correctness over raw speed. It is still fast, but it may take longer than some alternatives. In return, it can decompile scripts with 100k+ lines while preserving behavior close to the original source."},{heading:"the-pipeline",content:"The diagram gives a simplified view of how Volt turns script bytecode into readable Luau source."},{heading:"the-pipeline",content:"First, the bytecode is lifted into Volt's internal IR, or intermediate representation. This IR uses SSA form, where each temporary value is assigned once, and a CFG, which maps the blocks of code and the jumps between them."},{heading:"the-pipeline",content:"From there, the SSA pass pipeline simplifies the IR and removes unnecessary noise. Once the IR is clean enough, the CFG is lowered into a linear AST. The AST is a tree-shaped representation of the code that is much closer to real source."},{heading:"the-pipeline",content:"Finally, more AST passes clean up the structure, remove artifacts, and improve readability before the result is formatted and printed as Luau source code."},{heading:"options-and-tradeoffs",content:"Volt exposes SSA and AST pass controls through the DecompilerOptions type. These pass groups run at different stages of the pipeline, so you may want to toggle them for different reasons depending on whether you care more about speed, correctness, or readability."},{heading:"ssa-passes",content:"As of this writing, the only configurable SSA pass is the DecompilerOptions.ConditionalStructurer pass. This pass rewrites certain if and else control-flow patterns into equivalent and / or expressions."},{heading:"ssa-passes",content:"The output behaves the same, but it is often easier to read. The pass is relatively fast, even on large scripts, but it is not required for semantic correctness. Turning it off can noticeably reduce decompilation time on some scripts."},{heading:"ast-passes",content:"Most AST passes are worth leaving enabled. Passes like SmartVariableRenamer, FunctionDeclarations, and GuardClauses are very cheap and usually make the output much easier to read."},{heading:"ast-passes",content:"The main AST setting worth tuning is DoBlockInsertionThreshold. This controls when Volt wraps a region in a do ... end block to keep the number of live locals under Luau's limit."},{heading:"ast-passes",content:"You usually only need this when you want the decompiled script to compile again. If your goal is readability or analysis, setting the threshold to 0 disables this pass, which can make the output cleaner and slightly reduce decompilation time."},{heading:"formatting",content:"Formatting is mostly a matter of preference. The formatter has a negligible performance cost, taking about 30ms on a script with 100k lines of code."},{heading:"formatting",content:"Volt exposes formatter settings through DecompilerFormatter. See that API reference page for the full list of formatting options."},{heading:"related-reference",content:"decompile, DecompilerOptions, DecompilerFormatter"},{heading:"related-reference",content:"saveinstance"},{heading:"related-reference",content:"saveplace"}],headings:[{id:"how-it-works",content:"How It Works"},{id:"the-pipeline",content:"The Pipeline"},{id:"options-and-tradeoffs",content:"Options and Tradeoffs"},{id:"ssa-passes",content:"SSA Passes"},{id:"ast-passes",content:"AST Passes"},{id:"formatting",content:"Formatting"},{id:"related-reference",content:"Related Reference"}]};const c=[{depth:2,url:"#how-it-works",title:e.jsx(e.Fragment,{children:"How It Works"})},{depth:2,url:"#the-pipeline",title:e.jsx(e.Fragment,{children:"The Pipeline"})},{depth:3,url:"#options-and-tradeoffs",title:e.jsx(e.Fragment,{children:"Options and Tradeoffs"})},{depth:4,url:"#ssa-passes",title:e.jsx(e.Fragment,{children:"SSA Passes"})},{depth:4,url:"#ast-passes",title:e.jsx(e.Fragment,{children:"AST Passes"})},{depth:4,url:"#formatting",title:e.jsx(e.Fragment,{children:"Formatting"})},{depth:2,url:"#related-reference",title:e.jsx(e.Fragment,{children:"Related Reference"})}];function r(s){const t={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",ul:"ul",...s.components},{Mermaid:n}=t;return n||i("Mermaid"),e.jsxs(e.Fragment,{children:[e.jsx(t.p,{children:"Volt's decompiler turns Luau bytecode back into readable Luau source. The most important thing to know as a user is that decompilation runs asynchronously: calls that need source can yield while the decompiler works in the background, then resume when the result is ready."}),`
`,e.jsx(t.p,{children:"That behavior matters most for saves, where one operation may need source for many scripts before the final file can be written."}),`
`,e.jsx(t.h2,{id:"how-it-works",children:"How It Works"}),`
`,e.jsx(t.p,{children:"The decompiler work is scheduled as jobs. The Luau-facing operation yields while those jobs run, so long decompiles do not block the calling script thread."}),`
`,e.jsx(n,{chart:`flowchart LR
    start_call["Call starts"]
    results["Results"]

    subgraph queue [Scheduler queue]
        direction TB
        q_a(["script A"]) --- q_b(["script B"])
        q_c(["script C"]) --- q_more(["..."])
    end

    subgraph workers [Worker threads]
        direction TB
        thread1["Thread 1<br>script A"]
        thread2["Thread 2<br>script B"]
        thread3["Thread 3<br>script C"]
        thread1 --- thread2
        thread2 --- thread3
    end

    start_call --> queue
    queue --> workers
    workers --> results
    start_call <-.- results

    classDef script fill:#050607,stroke:#24272b,color:#f2f3f5
    classDef node fill:#1a1d20,stroke:#25282d,color:#f2f3f5
    classDef worker fill:#202326,stroke:#2a2d32,color:#f2f3f5
    class q_a,q_b,q_c,q_more script
    class start_call,results,thread1,thread2,thread3 node
    class thread1,thread2,thread3 worker

    linkStyle 0,1,2,3 stroke:transparent,fill:none
    linkStyle 7 stroke:#9da3aa,stroke-width:2px`}),`
`,e.jsx(t.p,{children:"The decompiler scheduler will configure itself automatically based on the number of available CPU cores. When these threads are not used, they are in a dormant state and don't utilize any CPU time."}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"/docs/scripts/decompile",children:e.jsx(t.code,{children:"decompile"})})," schedules one script and yields until the source is ready. ",e.jsx(t.a,{href:"/docs/miscellaneous/saveinstance",children:e.jsx(t.code,{children:"saveinstance"})})," and ",e.jsx(t.a,{href:"/docs/miscellaneous/saveplace",children:e.jsx(t.code,{children:"saveplace"})})," can schedule many scripts during a save, wait for the results, then finish writing the final place or model file."]}),`
`,e.jsx(t.h2,{id:"the-pipeline",children:"The Pipeline"}),`
`,e.jsx(t.p,{children:"This section explains how Volt's decompiler pipeline works, how each option changes the output, and what those choices mean for performance."}),`
`,e.jsx(t.p,{children:"Volt prioritizes semantic correctness over raw speed. It is still fast, but it may take longer than some alternatives. In return, it can decompile scripts with 100k+ lines while preserving behavior close to the original source."}),`
`,e.jsx(n,{chart:`%% volt:spacious-flow
%% volt:loop-top-to-bottom ssa_stack
%% volt:emphasize-title ssa_stack
%% volt:emphasize-title ast_stack
flowchart LR
    bytecode(["Bytecode"])
    cfg["Build CFG"]
    ssa_stack["SSA passes<br>simplify values<br>tidy logic<br>remove extras"]
    flatten["Flatten CFG"]
    ast_stack["AST passes<br>shape code<br>clean if/else<br>name variables<br>polish output"]
    format["Format"]
    source(["Source"])

    bytecode --> cfg --> ssa_stack --> flatten --> ast_stack --> format --> source
    ssa_stack -.-> ssa_stack

    classDef io fill:#050607,stroke:#24272b,stroke-width:2px,color:#f2f3f5
    classDef stage fill:#1a1d20,stroke:#2a2d32,stroke-width:2px,color:#f2f3f5
    classDef passGroup fill:#0b0c0f,stroke:#34383f,stroke-width:2px,color:#f2f3f5
    class bytecode io
    class cfg,flatten,format stage
    class ssa_stack,ast_stack passGroup
    class source io

    linkStyle 6 stroke:#9da3aa,stroke-width:2px,stroke-dasharray:3 5`}),`
`,e.jsx(t.p,{children:"The diagram gives a simplified view of how Volt turns script bytecode into readable Luau source."}),`
`,e.jsxs(t.p,{children:["First, the bytecode is lifted into Volt's internal IR, or ",e.jsx(t.a,{href:"https://en.wikipedia.org/wiki/Intermediate_representation",children:"intermediate representation"}),". This IR uses ",e.jsx(t.a,{href:"https://en.wikipedia.org/wiki/Static_single-assignment_form",children:"SSA form"}),", where each temporary value is assigned once, and a ",e.jsx(t.a,{href:"https://en.wikipedia.org/wiki/Control-flow_graph",children:"CFG"}),", which maps the blocks of code and the jumps between them."]}),`
`,e.jsxs(t.p,{children:["From there, the SSA pass pipeline simplifies the IR and removes unnecessary noise. Once the IR is clean enough, the CFG is lowered into a linear ",e.jsx(t.a,{href:"https://en.wikipedia.org/wiki/Abstract_syntax_tree",children:"AST"}),". The AST is a tree-shaped representation of the code that is much closer to real source."]}),`
`,e.jsx(t.p,{children:"Finally, more AST passes clean up the structure, remove artifacts, and improve readability before the result is formatted and printed as Luau source code."}),`
`,e.jsx(t.h3,{id:"options-and-tradeoffs",children:"Options and Tradeoffs"}),`
`,e.jsxs(t.p,{children:["Volt exposes SSA and AST pass controls through the ",e.jsx(t.code,{children:"DecompilerOptions"})," type. These pass groups run at different stages of the pipeline, so you may want to toggle them for different reasons depending on whether you care more about speed, correctness, or readability."]}),`
`,e.jsx(t.h4,{id:"ssa-passes",children:"SSA Passes"}),`
`,e.jsxs(t.p,{children:["As of this writing, the only configurable SSA pass is the ",e.jsx(t.code,{children:"DecompilerOptions.ConditionalStructurer"})," pass. This pass rewrites certain ",e.jsx(t.code,{children:"if"})," and ",e.jsx(t.code,{children:"else"})," control-flow patterns into equivalent ",e.jsx(t.code,{children:"and"})," / ",e.jsx(t.code,{children:"or"})," expressions."]}),`
`,e.jsx(t.p,{children:"The output behaves the same, but it is often easier to read. The pass is relatively fast, even on large scripts, but it is not required for semantic correctness. Turning it off can noticeably reduce decompilation time on some scripts."}),`
`,e.jsx(t.h4,{id:"ast-passes",children:"AST Passes"}),`
`,e.jsxs(t.p,{children:["Most AST passes are worth leaving enabled. Passes like ",e.jsx(t.code,{children:"SmartVariableRenamer"}),", ",e.jsx(t.code,{children:"FunctionDeclarations"}),", and ",e.jsx(t.code,{children:"GuardClauses"})," are very cheap and usually make the output much easier to read."]}),`
`,e.jsxs(t.p,{children:["The main AST setting worth tuning is ",e.jsx(t.code,{children:"DoBlockInsertionThreshold"}),". This controls when Volt wraps a region in a ",e.jsx(t.code,{children:"do ... end"})," block to keep the number of live locals under Luau's limit."]}),`
`,e.jsxs(t.p,{children:["You usually only need this when you want the decompiled script to compile again. If your goal is readability or analysis, setting the threshold to ",e.jsx(t.code,{children:"0"})," disables this pass, which can make the output cleaner and slightly reduce decompilation time."]}),`
`,e.jsx(t.h4,{id:"formatting",children:"Formatting"}),`
`,e.jsx(t.p,{children:"Formatting is mostly a matter of preference. The formatter has a negligible performance cost, taking about 30ms on a script with 100k lines of code."}),`
`,e.jsxs(t.p,{children:["Volt exposes formatter settings through ",e.jsx(t.a,{href:"/docs/scripts/decompile#decompilerformatter",children:e.jsx(t.code,{children:"DecompilerFormatter"})}),". See that API reference page for the full list of formatting options."]}),`
`,e.jsx(t.h2,{id:"related-reference",children:"Related Reference"}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.a,{href:"/docs/scripts/decompile",children:e.jsx(t.code,{children:"decompile"})}),", ",e.jsx(t.a,{href:"/docs/scripts/decompile#decompileroptions",children:e.jsx(t.code,{children:"DecompilerOptions"})}),", ",e.jsx(t.a,{href:"/docs/scripts/decompile#decompilerformatter",children:e.jsx(t.code,{children:"DecompilerFormatter"})})]}),`
`,e.jsx(t.li,{children:e.jsx(t.a,{href:"/docs/miscellaneous/saveinstance",children:e.jsx(t.code,{children:"saveinstance"})})}),`
`,e.jsx(t.li,{children:e.jsx(t.a,{href:"/docs/miscellaneous/saveplace",children:e.jsx(t.code,{children:"saveplace"})})}),`
`]})]})}function d(s={}){const{wrapper:t}=s.components||{};return t?e.jsx(t,{...s,children:e.jsx(r,{...s})}):r(s)}function i(s,t){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}export{d as default,a as frontmatter,l as structuredData,c as toc};
