import { j } from "./main-DJXeaSrE.js";
var o = new Map;
async function w(i, { api: h = "/api/search", locale: a, tag: e } = {}) {
  const q = (i || "").trim().toLowerCase();
  if (!q) return [];

  // 1. Instant check against comprehensive Orbit search index
  if (window.__ORBIT_SEARCH_INDEX__ && Array.isArray(window.__ORBIT_SEARCH_INDEX__)) {
    const matched = [];
    const qParts = q.split(/\s+/).filter(Boolean);
    for (const item of window.__ORBIT_SEARCH_INDEX__) {
      const content = (item.content || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      const id = (item.id || "").toLowerCase();
      const crumbs = (item.breadcrumbs || []).join(" ").toLowerCase();
      const text = `${content} ${desc} ${id} ${crumbs}`;
      if (qParts.every(part => text.includes(part))) {
        matched.push(item);
      }
    }
    if (matched.length > 0) {
      return matched.slice(0, 30);
    }
  }

  // 2. Tree search fallback
  const trees = window.__DOCS_TREES__ || (window.$R && window.$R.tsr ? { docs: window.$R.tsr[19], guides: window.$R.tsr[536], releases: window.$R.tsr[543] } : {});
  const res = [];
  function searchInTree(t, q, res, crumbs = []) {
    if (!t) return;
    if (t.type === "page" && t.url) {
      const nm = (t.name || "").toLowerCase().includes(q);
      const dm = (t.description || "").toLowerCase().includes(q);
      if (nm || dm) {
        res.push({ id: t.url, type: "page", content: t.name || "", url: t.url, breadcrumbs: [...crumbs] });
      }
    }
    const cur = t.name && t.type !== "page" ? [...crumbs, t.name] : crumbs;
    if (t.index && t.index.url) {
      const nm = (t.index.name || "").toLowerCase().includes(q);
      const dm = (t.index.description || "").toLowerCase().includes(q);
      if (nm || dm) {
        res.push({ id: t.index.url, type: "page", content: t.index.name || "", url: t.index.url, breadcrumbs: cur });
      }
    }
    if (Array.isArray(t.children)) {
      for (const c of t.children) {
        searchInTree(c, q, res, cur);
      }
    }
  }
  searchInTree(trees.docs, q, res, ["Docs"]);
  if (trees.guides) searchInTree(trees.guides, q, res, ["Guides"]);
  if (trees.releases) searchInTree(trees.releases, q, res, ["Release Notes"]);
  return res.slice(0, 25);
}
export { w as fetchDocs, j };
