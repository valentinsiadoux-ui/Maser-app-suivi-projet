// Main menu: entries, side/top position, mobile drawer, optional pages and the "Projects" sub-menu.
// Markup: layout/sidebar.html, layout/top-nav.html, layout/project-menu.html.
import { readPrefs, updatePrefs, applyPrefs } from '../core/preferences.js';

export const navigation = () => ({
  // menu entries. `only`: roles that see the entry; `opt`: optional page, off by default (Settings › Appearance)
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
  get items() { return this.nav.filter((i) => (!i.only || i.only.includes(this.role)) && (!i.opt || this.optPages[i.opt])); },
  isActive(href) { return href === this.page; },

  // ---------- menu position (side | top) and mobile drawer ----------
  layout: readPrefs().navLayout,
  mobileOpen: false,
  setLayout(v) {
    this.layout = v;
    updatePrefs({ navLayout: v });
    applyPrefs();
    this.mobileOpen = false;
  },

  // ---------- optional pages (enabled in Settings › Appearance) ----------
  optPages: readPrefs().optPages,
  get pageEnabled() { return !this.optKey || !!this.optPages[this.optKey]; },

  // ---------- "Projects" sub-menu: accessible projects, by category ----------
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
  // floating project picker of the top menu
  openProjMenu(ev) { const r = ev.currentTarget.getBoundingClientRect(); this.projMenu = { open: !this.projMenu.open, x: Math.max(8, Math.min(r.left, window.innerWidth - 296)), y: r.bottom + 6 }; },
});
