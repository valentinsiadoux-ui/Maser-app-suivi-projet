// Navigation sans rechargement (application monopage).
// Les maquettes naviguent par liens « page.html?param=… » : on garde ces liens tels quels
// et on les traduit en routes { name, query }.
//  - Dans Apps Script : la route est reflétée dans l'URL de la web app
//    (…/exec?id=p1#project-detail) via google.script.history / google.script.url.
//  - En local (npm run dev) : dans le hash (#/project-detail?id=p1).

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

// Route de départ (asynchrone dans Apps Script)
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

// Boutons Précédent / Suivant du navigateur
export function onLocationChange(cb) {
  const g = gas();
  if (g) g.history.setChangeHandler((e) => cb({ name: e.location.hash || '', query: fromParams(e.location.parameter) }));
  else window.addEventListener('popstate', () => cb(fromHash()));
}
