// Keeps the browser URL in sync with the current page (route = { name, query }).
// Links in the templates keep the mockups' form "page.html?param=…"; parseHref() turns them into routes.
//  - In Apps Script: the route is shown in the web app URL (…/exec?id=p1#project-detail)
//    through google.script.history / google.script.url.
//  - Locally (npm run dev): in the hash (#/project-detail?id=p1).
// The route state itself lives in core/router.js.

const gas = () => (typeof google !== 'undefined' && google.script && google.script.history ? google.script : null);

// 'project-detail.html?id=p1&tab=tasks' → { name: 'project-detail', query: 'id=p1&tab=tasks' }
export function parseHref(href) {
  const m = /^(?:\.?\/)?([a-z][a-z-]*)\.html(?:\?([^#]*))?$/.exec(href || '');
  return m ? { name: m[1], query: m[2] || '' } : null;
}

const toParams = (query) => {
  const out = {};
  new URLSearchParams(query).forEach((v, k) => { out[k] = v; });
  return out;
};
const fromParams = (parameter) => new URLSearchParams(parameter || {}).toString();
const fromHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [name, query = ''] = h.split('?');
  return { name, query };
};

// Route of the first page (asynchronous in Apps Script)
export function readLocation(cb) {
  const g = gas();
  if (g) g.url.getLocation((loc) => cb({ name: loc.hash || '', query: fromParams(loc.parameter) }));
  else cb(fromHash());
}

export function writeLocation(route, replace = false) {
  const g = gas();
  if (g) {
    g.history[replace ? 'replace' : 'push'](null, toParams(route.query), route.name);
  } else {
    const url = '#/' + route.name + (route.query ? '?' + route.query : '');
    try { history[replace ? 'replaceState' : 'pushState'](null, '', url); } catch (_) {}
  }
}

// Browser Back / Forward buttons
export function onLocationChange(cb) {
  const g = gas();
  if (g) g.history.setChangeHandler((e) => cb({ name: e.location.hash || '', query: fromParams(e.location.parameter) }));
  else window.addEventListener('popstate', () => cb(fromHash()));
}
