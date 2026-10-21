// Composant racine (x-data="app" sur <body>) : coquille commune à toutes les pages
// (utilisateur, droits, menu, recherche, profil, création de projet) + navigation.
// Chaque page est un composant imbriqué (js/pages/*.js) qui hérite de ces données.
import moment from 'moment';
import { TODAY, DATA } from './data/demo.js';
import {
  PALETTE, TONES, PRIORITY_TONE, TASK_TONE, DEADLINE, PROJECT_TONE, ROLE_TONE, DEFAULT_USER,
  AMENDMENT_TONE, TEST_TONE, CAT_TONE, TASK_BAR, ROUTES, DEFAULT_ROUTE,
} from './constants.js';
import { parseHref, readLocation, writeLocation, onLocationChange } from './router.js';

// lecture d'une collection modifiée localement (localStorage), sinon données de démonstration
const stored = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } };
const prefs = () => { try { return JSON.parse(localStorage.getItem('maser-prefs-v1') || '{}'); } catch (_) { return {}; } };

export default () => ({
  ...DATA,
  // hiérarchie : surcharges faites dans la page Organisation (localStorage, partagées entre les pages)
  members: (() => { let o = {}; try { o = JSON.parse(localStorage.getItem('maser-supervisors') || '{}'); } catch (_) {} return DATA.members.map((m) => (m.id in o ? { ...m, supervisorId: o[m.id] || undefined } : m)); })(),
  allTasks: stored('maser-tasks', DATA.allTasks),
  allTests: stored('maser-tests', DATA.allTests),
  allMeetings: stored('maser-meetings', DATA.allMeetings),
  allNotes: stored('maser-notes', DATA.allNotes),
  allAmendments: stored('maser-amendments', DATA.allAmendments),
  TONES, ROLE_TONE, PRIORITY_TONE, TASK_TONE, DEADLINE, PROJECT_TONE, AMENDMENT_TONE, TEST_TONE, CAT_TONE, TASK_BAR,
  userId: localStorage.getItem('maser-user') || 'u2',
  layout: prefs().navLayout || 'side',
  mobileOpen: false, createOpen: false, profileOpen: false, notifOpen: false,
  query: '', searchOpen: false,
  form: { name: '', client: '', priority: 'Medium', startDate: '2026-10-19', endDate: '2027-03-26', tags: '', budget: '', description: '' },
  nav: [
    { href: 'dashboard.html', label: 'Dashboard', icon: 'layout-dashboard' },
    { href: 'projects.html', label: 'Projects', icon: 'folder-kanban', projects: true },
    { href: 'tasks.html', label: 'Tasks', icon: 'list-checks', opt: 'tasks' },
    { href: 'tests.html', label: 'Tests', icon: 'flask-conical', opt: 'tests' },
    { href: 'notes.html', label: 'Notes', icon: 'notebook-pen', opt: 'notes' },
    { href: 'amendments.html', label: 'Amendments', icon: 'file-diff', hint: 'Avenants', opt: 'amendments' },
    { href: 'meetings.html', label: 'Meetings', icon: 'calendar-days', hint: 'Réunions', opt: 'meetings' },
    { href: 'team-schedule.html', label: 'Team Schedule', icon: 'calendar-range', hint: 'Planning', only: ['Admin', 'Manager'] },
    { href: 'organisation.html', label: 'Organisation', icon: 'users', hint: 'Hiérarchie' },
    { href: 'my-schedule.html', label: 'My Schedule', icon: 'calendar-range', hint: 'Planning', only: ['Collaborator'] },
  ],
  roles: [
    { role: 'Admin', description: 'Full access & settings' },
    { role: 'Manager', description: 'Manage their projects & team' },
    { role: 'Collaborator', description: 'Work on assigned tasks' },
    { role: 'Client', description: 'Client Space only' },
  ],

  // ---------- navigation (application monopage) ----------
  route: { name: null, query: '' },
  // la page affichée peut brancher ses propres fermetures (Échap) et son contexte de recherche
  pageApi: null,
  init() {
    // les liens « page.html?… » des maquettes deviennent des changements de route
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self')) return;
      if (!parseHref(a.getAttribute('href'))) return;
      e.preventDefault();
      this.go(a.getAttribute('href'));
    });
    onLocationChange((r) => this.show(r));
    readLocation((r) => this.show(r));
  },
  // affiche une route (remonte la page, comme un chargement de page dans les maquettes)
  show(r) {
    const next = { name: ROUTES[r.name] ? r.name : DEFAULT_ROUTE, query: r.query || '' };
    this.closeAll();
    this.pageApi = null;
    document.title = (ROUTES[next.name].title ? ROUTES[next.name].title + ' · ' : '') + 'Maser Engineering';
    window.scrollTo(0, 0);
    if (this.route.name === next.name) {
      this.route = { name: null, query: '' };
      this.$nextTick(() => { this.route = next; });
    } else {
      this.route = next;
    }
  },
  go(href) {
    const r = parseHref(href);
    if (!r) { window.open(href, '_blank', 'noopener'); return; }
    writeLocation(r);
    this.show(r);
  },
  // met à jour l'adresse sans recharger la page (onglets, sections)
  replaceRoute(href) {
    const r = parseHref(href); if (!r) return;
    this.route = { ...this.route, query: r.query };
    writeLocation(r, true);
  },
  usePage(api) { this.pageApi = api; },
  get params() { return new URLSearchParams(this.route.query); },
  get page() { return ROUTES[this.route.name]?.nav ?? ''; },
  get optKey() { return ROUTES[this.route.name]?.opt; },
  get searchCtx() { return this.pageApi?.searchCtx?.() ?? null; },
  get projectId() { return this.route.name === 'project-detail' ? this.params.get('id') : null; },

  // ---------- utilisateur, rôle, droits de lecture ----------
  get user() { return this.members.find((m) => m.id === this.userId) || this.members[1]; },
  get role() { return this.eff(this.user); },
  get isClient() { return this.role === 'Client'; },
  get items() { return this.nav.filter((i) => (!i.only || i.only.includes(this.role)) && (!i.opt || this.optPages[i.opt])); },
  get sameRole() { return this.members.filter((m) => this.eff(m) === this.role); },
  subs(id) {
    const out = [], seen = new Set([id]), q = [id];
    while (q.length) { const x = q.shift(); this.members.forEach((m) => { if (m.supervisorId === x && !seen.has(m.id)) { seen.add(m.id); out.push(m); q.push(m.id); } }); }
    return out;
  },
  access(p) {
    if (this.role === 'Admin') return true;
    return [this.user, ...this.subs(this.user.id)].some((m) => p.memberIds.includes(m.id));
  },
  // un collaborateur ne voit que ses projets ; Admin et Manager voient tout
  get scoped() { return this.role === 'Collaborator'; },
  get projects() { return this.scoped ? this.allProjects.filter((p) => this.access(p)) : this.allProjects; },
  get pids() { return new Set(this.projects.map((p) => p.id)); },
  get tasks() { return this.scoped ? this.allTasks.filter((t) => this.pids.has(t.projectId)) : this.allTasks; },
  get tests() { return this.scoped ? this.allTests.filter((t) => this.pids.has(t.projectId)) : this.allTests; },
  get meetings() { return this.scoped ? this.allMeetings.filter((m) => this.pids.has(m.projectId)) : this.allMeetings; },
  get notes() {
    const team = new Set([this.user, ...this.subs(this.user.id)].map((m) => m.id));
    return this.allNotes.filter((n) => {
      const p = this.getProject(n.projectId);
      if (this.role === 'Collaborator') return !!p && this.access(p);
      if (this.role === 'Manager') return !!p && (p.memberIds.includes(this.user.id) || team.has(n.authorId));
      return true;
    });
  },
  getMember(id) { return this.members.find((m) => m.id === id); },
  getProject(id) { return this.allProjects.find((p) => p.id === id); },
  progress(p) {
    const l = this.allTasks.filter((t) => t.projectId === p.id);
    if (!l.length) return 0;
    const s = l.reduce((a, t) => a + (t.status === 'Done' ? 1 : t.status === 'Review' ? 0.75 : t.status === 'In Progress' ? 0.4 : 0), 0);
    return Math.round((s / l.length) * 100);
  },

  // ---------- dates (Moment.js) ----------
  daysUntil(d) { return moment(d).startOf('day').diff(moment(TODAY), 'days'); },
  deadlineState(end, done) {
    if (done) return 'complete';
    const n = this.daysUntil(end);
    return n < 0 ? 'overdue' : n <= 14 ? 'soon' : 'on-track';
  },
  fd(d, f = 'D MMM') { return moment(d).format(f); },
  ft(d) { return moment(d).format('HH:mm'); },
  fdt(d) { return moment(d).format('D MMM') + ' · ' + moment(d).format('HH:mm'); },

  // ---------- aides d'affichage ----------
  color(id) { return PALETTE[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length]; },
  stack(ids, max = 4) { return ids.slice(0, max).map((id) => this.getMember(id)).filter(Boolean); },
  rest(ids, max = 4) { return Math.max(0, ids.length - max); },
  isActive(href) { return href === this.page; },
  get unread() { return this.notifications.filter((n) => n.unread).length; },

  // ---------- pages transversales facultatives (désactivées par défaut, activables dans Settings) ----------
  optPages: (() => { const base = { tasks: false, tests: false, notes: false, amendments: false, meetings: false }; return { ...base, ...(prefs().optPages || {}) }; })(),
  get pageEnabled() { return !this.optKey || !!this.optPages[this.optKey]; },

  // ---------- rôle effectif : être placé au-dessus d'un manager (directement ou non) donne les droits de manager ----------
  eff(m) { return m.role === 'Collaborator' && this.subs(m.id).some((s) => s.role === 'Manager') ? 'Manager' : m.role; },

  // ---------- sous-menu « Projects » : projets accessibles, rangés par catégories ----------
  projOpen: {},
  projMenu: { open: false, x: 0, y: 0 },
  get inProjects() { return this.page === 'projects.html'; },
  get currentProjectId() { return this.projectId ?? null; },
  get projectGroups() {
    const isMine = (p) => this.role === 'Admin' || this.access(p);
    const sort = (l) => [...l].sort((a, b) => a.code.localeCompare(b.code));
    const active = this.projects.filter((p) => p.status === 'In Progress'), done = this.projects.filter((p) => p.status !== 'In Progress');
    return [
      { id: 'mine', label: 'My projects', items: sort(active.filter(isMine)) },
      { id: 'other', label: 'Other projects', hint: 'view only', items: sort(active.filter((p) => !isMine(p))) },
      { id: 'closed', label: 'Closed & archived', items: sort(done) },
    ].filter((g) => g.items.length > 0);
  },
  isOpen(g) { return this.projOpen[g.id] ?? (g.id === 'mine' || g.items.some((p) => p.id === this.currentProjectId)); },
  toggleGroup(g) { this.projOpen = { ...this.projOpen, [g.id]: !this.isOpen(g) }; },
  openProjMenu(ev) { const r = ev.currentTarget.getBoundingClientRect(); this.projMenu = { open: !this.projMenu.open, x: Math.max(8, Math.min(r.left, window.innerWidth - 296)), y: r.bottom + 6 }; },

  // ---------- recherche globale : projets, tâches, tests, notes — la page courante passe en premier ----------
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
  get firstResult() { return this.results.find((r) => !r.header); },

  // ---------- profil : rôle, personne, position du menu ----------
  switchRole(next) {
    localStorage.setItem('maser-user', DEFAULT_USER[next]);
    this.userId = DEFAULT_USER[next];
    this.profileOpen = false;
    if (next === 'Client') this.go('client-space.html');
  },
  switchUser(id) { localStorage.setItem('maser-user', id); this.userId = id; this.profileOpen = false; },
  setLayout(v) {
    this.layout = v;
    const p = prefs();
    p.navLayout = v; localStorage.setItem('maser-prefs-v1', JSON.stringify(p));
    if (v === 'side') document.documentElement.removeAttribute('data-nav'); else document.documentElement.setAttribute('data-nav', v);
    this.mobileOpen = false;
  },
  closeAll() { this.pageApi?.close?.(); this.mobileOpen = false; this.createOpen = false; this.profileOpen = false; this.notifOpen = false; this.searchOpen = false; this.projMenu.open = false; },

  // ---------- création de projet (visuel : redirige vers la liste) ----------
  openCreate() { this.mobileOpen = false; this.createOpen = true; this.$nextTick(() => this.$refs.pname && this.$refs.pname.focus()); },
  get validForm() { return this.form.name.trim() && this.form.client.trim() && this.form.startDate && this.form.endDate >= this.form.startDate; },
  submitProject() { if (this.validForm) this.go('projects.html'); },
});
