// Global search (header): projects, tasks, tests and notes the user can see.
// Results from the current page's project / kind come first: a page provides that context
// with usePage({ searchCtx: () => ({ project, kind }) }).
// Markup: layout/search.html.

export const search = () => ({
  query: '',
  searchOpen: false,
  get searchCtx() { return this.pageApi?.searchCtx?.() ?? null; },

  get results() {
    const q = this.query.trim().toLowerCase();
    if (!q) return [];
    const has = (...s) => s.some((x) => (x || '').toLowerCase().includes(q));
    const pn = (id) => this.getProject(id)?.name ?? '';
    const snippet = (s) => (s.length > 70 ? s.slice(0, 67) + '…' : s);
    const items = [
      ...this.projects.filter((x) => has(x.name, x.client, x.code, ...x.tags)).map((x) => ({ key: 'p' + x.id, kind: 'project', projectId: x.id, title: x.name, sub: `${x.code} · ${x.client}`, href: `project-detail.html?id=${x.id}` })),
      ...this.tasks.filter((x) => has(x.title)).map((x) => ({ key: 't' + x.id, kind: 'task', projectId: x.projectId, title: x.title, sub: `Task · ${pn(x.projectId)}`, href: `project-detail.html?id=${x.projectId}&tab=tasks` })),
      ...this.tests.filter((x) => has(x.name, x.campaign)).map((x) => ({ key: 'q' + x.id, kind: 'test', projectId: x.projectId, title: x.name, sub: `Test · ${x.campaign} · ${pn(x.projectId)}`, href: `project-detail.html?id=${x.projectId}&tab=tests` })),
      ...this.notes.filter((x) => has(x.content)).map((x) => ({ key: 'n' + x.id, kind: 'note', projectId: x.projectId, title: snippet(x.content), sub: `Note · ${x.category} · ${pn(x.projectId)}`, href: `project-detail.html?id=${x.projectId}&tab=notes` })),
    ];
    const ctx = this.searchCtx ?? { project: null, kind: null }, labels = { project: 'Projects', task: 'Tasks', test: 'Tests', note: 'Notes' };
    const out = [], used = new Set();
    if (ctx.project) {
      const here = items.filter((i) => i.projectId === ctx.project).sort((a, b) => (b.kind === ctx.kind) - (a.kind === ctx.kind));
      if (here.length) { out.push({ header: true, key: 'h-here', label: 'In this project' }); here.slice(0, 6).forEach((i) => { out.push(i); used.add(i.key); }); }
    }
    const order = ['project', 'task', 'test', 'note'], kinds = ctx.kind ? [ctx.kind, ...order.filter((k) => k !== ctx.kind)] : order;
    for (const k of kinds) {
      const g = items.filter((i) => i.kind === k && !used.has(i.key)).slice(0, 4);
      if (g.length) { out.push({ header: true, key: 'h-' + k, label: labels[k] }); out.push(...g); }
    }
    return out;
  },
  // Enter in the search field opens the first result
  get firstResult() { return this.results.find((r) => !r.header); },
});
