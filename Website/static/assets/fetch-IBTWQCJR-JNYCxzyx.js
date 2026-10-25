var o=new Map;
function searchInTree(t,q,res,crumbs=[]){
  if(!t)return;
  if(t.type==="page"&&t.url){
    const nm=(t.name||"").toLowerCase().includes(q);
    const dm=(t.description||"").toLowerCase().includes(q);
    if(nm||dm){
      res.push({id:t.url,type:"page",content:t.name||"",url:t.url,breadcrumbs:[...crumbs]});
    }
  }
  const cur=t.name&&t.type!=="page"?[...crumbs,t.name]:crumbs;
  if(t.index&&t.index.url){
    const nm=(t.index.name||"").toLowerCase().includes(q);
    const dm=(t.index.description||"").toLowerCase().includes(q);
    if(nm||dm){
      res.push({id:t.index.url,type:"page",content:t.index.name||"",url:t.index.url,breadcrumbs:cur});
    }
  }
  if(Array.isArray(t.children)){
    for(const c of t.children){
      searchInTree(c,q,res,cur);
    }
  }
}
async function w(i,{api:h="/api/search",locale:a,tag:e}={}){
  const q=(i||"").trim().toLowerCase();
  if(!q)return[];
  const trees=window.__DOCS_TREES__||(window.$R&&window.$R.tsr?{docs:window.$R.tsr[19],guides:window.$R.tsr[536],releases:window.$R.tsr[543]}:{});
  const res=[];
  searchInTree(trees.docs,q,res,["Docs"]);
  searchInTree(trees.guides,q,res,["Guides"]);
  searchInTree(trees.releases,q,res,["Release Notes"]);
  return res.slice(0,25);
}
export{w as fetchDocs};
