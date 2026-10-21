// Page « Paramètres » (maquette : mocks/settings.html)

export default () => ({
  sec: 'profile',
  saved: false,
  sysDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  prefs: { theme: 'system', palette: 'maser', density: 'comfortable', taskView: 'board', navLayout: 'side', optPages: { tasks: false, tests: false, notes: false, amendments: false, meetings: false } },
  OPT_ITEMS: [
    { id: 'tasks', label: 'Tasks', desc: 'Every task across your projects, as a Board or a List.' },
    { id: 'tests', label: 'Tests', desc: 'Test campaigns and results across projects.' },
    { id: 'notes', label: 'Notes', desc: 'Technical notes, site visits and decisions across projects.' },
    { id: 'amendments', label: 'Amendments', desc: 'Contract amendments (avenants) and the approval workflow.' },
    { id: 'meetings', label: 'Meetings', desc: 'Upcoming and past meetings across projects.' },
  ],
  setOpt(id, on) { this.setPref('optPages', { ...this.prefs.optPages, [id]: on }); },
  s: {},
  PALETTES: [
    { id: 'maser', name: 'Maser', description: 'The brand palette: warm greys and signal red.', light: { bg: '#f6f6f6', card: '#ffffff', sidebar: '#4f4c4d', primary: '#e63641', fg: '#2b2929' }, dark: { bg: '#1c1b1b', card: '#272525', sidebar: '#4f4c4d', primary: '#e63641', fg: '#f6f6f6' } },
    { id: 'ocean', name: 'Ocean', description: 'Cool slate with an engineering blue.', light: { bg: '#f4f6f9', card: '#ffffff', sidebar: '#1e293b', primary: '#2f6fe4', fg: '#1b2430' }, dark: { bg: '#121820', card: '#1b232d', sidebar: '#1e293b', primary: '#2f6fe4', fg: '#f1f5f9' } },
    { id: 'forest', name: 'Forest', description: 'Calm stone tones with a deep green.', light: { bg: '#f5f6f3', card: '#ffffff', sidebar: '#24332b', primary: '#1f8a5b', fg: '#232a25' }, dark: { bg: '#141a16', card: '#1e2520', sidebar: '#24332b', primary: '#1f8a5b', fg: '#f3f6f3' } },
    { id: 'sunset', name: 'Sunset', description: 'Warm sand backgrounds and burnt orange.', light: { bg: '#f7f5f2', card: '#ffffff', sidebar: '#3b322b', primary: '#d9480f', fg: '#2d2825' }, dark: { bg: '#1c1916', card: '#28231f', sidebar: '#3b322b', primary: '#d9480f', fg: '#f7f3ee' } },
    { id: 'violet', name: 'Violet', description: 'Soft lilac greys with a vivid violet.', light: { bg: '#f6f5f9', card: '#ffffff', sidebar: '#2e2a40', primary: '#7c3aed', fg: '#272433' }, dark: { bg: '#16141c', card: '#211e2b', sidebar: '#2e2a40', primary: '#7c3aed', fg: '#f4f2fa' } },
    { id: 'graphite', name: 'Graphite', description: 'Monochrome, no accent colour.', light: { bg: '#f6f6f6', card: '#ffffff', sidebar: '#1c1b1b', primary: '#2b2929', fg: '#2b2929' }, dark: { bg: '#1c1b1b', card: '#272525', sidebar: '#1c1b1b', primary: '#f6f6f6', fg: '#f6f6f6' } },
  ],
  MODES: [{ id: 'light', label: 'Light', icon: 'sun' }, { id: 'dark', label: 'Dark', icon: 'moon' }, { id: 'system', label: 'System', icon: 'monitor' }],
  NAVS: [{ id: 'side', label: 'Side menu', desc: 'Vertical menu on the left. Best on wide screens.' }, { id: 'top', label: 'Top menu', desc: 'Horizontal menu under the header. Frees horizontal space.' }],
  SIZES: [{ v: 'compact', l: 'Compact' }, { v: 'comfortable', l: 'Default' }, { v: 'large', l: 'Large' }],
  VIEWS: [{ v: 'board', l: 'Board' }, { v: 'list', l: 'List' }],
  DAYS: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  ABSENCE_TYPES: ['Annual leave', 'Sick leave', 'Training', 'Other'],
  INTEGRATIONS: [
    { id: 'meet', name: 'Google Meet', desc: 'Add a video link automatically when you schedule a meeting.' },
    { id: 'teams', name: 'Microsoft Teams', desc: 'Use Teams for meeting links and notifications.' },
    { id: 'gcal', name: 'Google Calendar', desc: 'Sync meetings and task deadlines to your calendar.' },
    { id: 'outlook', name: 'Outlook Calendar', desc: 'Two-way calendar sync with Microsoft 365.' },
    { id: 'slack', name: 'Slack', desc: 'Post project updates and alerts to a channel.' },
  ],
  PERM_COLS: ['Admin', 'Manager', 'Project lead', 'Collaborator', 'Client'],
  PERM_ROWS: [
    ['See projects', 'All', 'All (view only outside their own)', 'Their projects', 'Their projects', "Their company's"],
    ['Create & edit tasks, validate tests', 'All', "Their projects and team's", 'Their projects', 'Their projects', '—'],
    ['Create amendments', 'Yes', 'Yes', 'Yes', 'Yes', '—'],
    ['Approve amendments', 'All', 'Their projects', 'Their project', '—', '—'],
    ['Schedule meetings', 'All', 'Their projects', 'Their project', '—', '—'],
    ['Assign a project lead', 'All', 'Their projects', '—', '—', '—'],
    ['Read notes', 'All', "Their projects and team's", 'Their projects', 'Their projects', 'Client messages'],
    ['Team schedule', 'Everyone', 'Their team', '—', '—', '—'],
    ['View the organisation', 'Yes', 'Yes', 'Yes', 'Yes', '—'],
    ['Edit the organisation', 'Everyone', 'People below them', 'People below them', 'People below them', '—'],
    ['Settings', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
  ],
  LOG: [
    { type: 'Amendments', who: 'u2', what: 'approved amendment AV-002', code: 'MSR-2401', when: 'Today, 09:12' },
    { type: 'Tests', who: 'u4', what: 'marked “Overcurrent relay injection” as Failed', code: 'MSR-2401', when: 'Today, 08:47' },
    { type: 'Tasks', who: 'u3', what: 'moved “Earthing grid calculation” to Review', code: 'MSR-2401', when: 'Yesterday, 17:30' },
    { type: 'Access', who: 'u1', what: 'changed the supervisor of Julien Moreau', code: '', when: 'Yesterday, 15:05' },
    { type: 'Meetings', who: 'u6', what: 'scheduled “Seismic design workshop”', code: 'MSR-2402', when: 'Yesterday, 11:20' },
    { type: 'Amendments', who: 'u5', what: 'created amendment AV-004', code: 'MSR-2401', when: '14 Oct, 16:40' },
    { type: 'Tasks', who: 'u5', what: 'created task “Cable routing & trench layout”', code: 'MSR-2401', when: '14 Oct, 10:02' },
    { type: 'Access', who: 'u6', what: 'assigned Amina Benali as project lead', code: 'MSR-2402', when: '13 Oct, 14:18' },
    { type: 'Tests', who: 'u3', what: 'marked “Insulation resistance test” as Passed', code: 'MSR-2402', when: '12 Oct, 09:55' },
    { type: 'Meetings', who: 'u2', what: 'scheduled “Client progress review”', code: 'MSR-2401', when: '10 Oct, 13:25' },
  ],
  STAFF_EVENTS: [
    { id: 'assigned', label: 'A task is assigned to me', roles: ['Admin', 'Manager', 'Collaborator'] },
    { id: 'due', label: 'A task is due soon', roles: ['Admin', 'Manager', 'Collaborator'] },
    { id: 'test', label: 'A test fails on my projects', roles: ['Admin', 'Manager', 'Collaborator'] },
    { id: 'approval', label: 'An amendment awaits my approval', roles: ['Admin', 'Manager'] },
    { id: 'meeting', label: 'I am invited to a meeting', roles: ['Admin', 'Manager', 'Collaborator'] },
    { id: 'note', label: 'Someone comments on a note', roles: ['Admin', 'Manager', 'Collaborator'] },
  ],
  CLIENT_EVENTS: [
    { id: 'milestone', label: 'A project milestone is reached' }, { id: 'amend', label: 'A new amendment needs my review' },
    { id: 'meeting', label: 'I am invited to a meeting' }, { id: 'message', label: 'The team sends me a message' },
  ],

  init() {
    this.sec = this.params.get('section') || 'profile';
    this.prefs = this.readPrefs();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', (e) => { this.sysDark = e.matches; });
    this.resetForms();
    this.$watch('userId', () => this.resetForms());
  },
  readPrefs() {
    const base = { theme: 'system', palette: 'maser', density: 'comfortable', taskView: 'board', navLayout: 'side', optPages: { tasks: false, tests: false, notes: false, amendments: false, meetings: false } };
    try { const s = JSON.parse(localStorage.getItem('maser-prefs-v1') || '{}'); return { ...base, ...s, optPages: { ...base.optPages, ...(s.optPages || {}) } }; }
    catch (_) { return base; }
  },
  // formulaires « visuels » (non enregistrés) initialisés d'après la personne connectée
  resetForms() {
    const u = this.user, [first, ...rest] = u.name.split(' ');
    const domain = u.company ? u.company.toLowerCase().replace(/[^a-z]/g, '') + '.com' : 'maser-engineering.com';
    const ev = this.role === 'Client' ? this.CLIENT_EVENTS : this.STAFF_EVENTS.filter((e) => e.roles.includes(this.role));
    const notif = {};
    ev.forEach((e) => { notif[e.id + ':app'] = true; notif[e.id + ':mail'] = ['due', 'approval', 'milestone'].includes(e.id); });
    this.s = {
      profile: { name: u.name, title: u.title, email: `${first.toLowerCase()}.${rest.join('').toLowerCase()}@${domain}`, phone: '+33 5 61 00 00 00', signature: `${u.name}\n${u.title}` },
      lang: 'en', date: 'dmy', time: '24', week: 'mon', tz: 'Europe/Paris',
      notif, events: ev, digest: 'daily', quiet: false,
      twoFA: false,
      sessions: [
        { id: 's1', device: 'Chrome on Windows', place: 'Toulouse, FR', when: 'Active now', current: true, icon: 'laptop' },
        { id: 's2', device: 'Safari on iPhone', place: 'Toulouse, FR', when: 'Yesterday, 18:42', current: false, icon: 'smartphone' },
        { id: 's3', device: 'Firefox on macOS', place: 'Paris, FR', when: '12 Oct, 09:15', current: false, icon: 'laptop' },
      ],
      team: { lead: '3', digest: true, overload: true, deleg: false, who: (this.members.find((m) => m.role !== 'Client' && m.id !== u.id) || {}).id || '', from: '2026-12-21', until: '2027-01-04' },
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      absences: [{ id: 'a1', type: 'Annual leave', start: '2026-12-21', end: '2026-12-31', note: 'Christmas break' }],
      draft: { type: 'Annual leave', start: '', end: '', note: '' },
      integ: { meet: true, teams: false, gcal: true, outlook: false, slack: false },
      ws: { prefix: 'MSR', currency: 'EUR', prio: 'Medium', threshold: '50000', clientsComment: true },
      logType: 'All',
    };
  },
  flashSaved() { this.saved = true; setTimeout(() => { this.saved = false; }, 2200); },

  // ----- navigation entre sections -----
  get sections() {
    const R = this.role;
    const all = [
      { id: 'profile', label: 'Profile', icon: 'user' }, { id: 'appearance', label: 'Appearance', icon: 'palette' },
      { id: 'language', label: 'Language & region', icon: 'globe' }, { id: 'notifications', label: 'Notifications', icon: 'bell' },
      { id: 'security', label: 'Security', icon: 'shield-check' },
      { id: 'team', label: 'Team preferences', icon: 'users', roles: ['Manager'] },
      { id: 'availability', label: 'Availability', icon: 'calendar-days', roles: ['Collaborator', 'Manager'] },
      { id: 'contacts', label: 'Your contacts', icon: 'users', roles: ['Client'] },
      { id: 'integrations', label: 'Integrations', icon: 'plug', roles: ['Admin', 'Manager'] },
      { id: 'workspace', label: 'Workspace', icon: 'building-2', roles: ['Admin'] },
      { id: 'permissions', label: 'Roles & permissions', icon: 'key-round', roles: ['Admin'] },
      { id: 'activity', label: 'Activity log', icon: 'scroll-text', roles: ['Admin'] },
    ];
    return all.filter((s) => !s.roles || s.roles.includes(R));
  },
  get accountSections() { return this.sections.filter((s) => !s.roles); },
  get roleSections() { return this.sections.filter((s) => s.roles); },
  get current() { return (this.sections.find((s) => s.id === this.sec) || this.sections[0]).id; },
  go(id) { this.sec = id; this.replaceRoute('settings.html?section=' + id); },

  // ----- apparence : thème, palette, taille, menu, vue par défaut (fonctionnel, mémorisé) -----
  get resolvedMode() { return this.prefs.theme === 'system' ? (this.sysDark ? 'dark' : 'light') : this.prefs.theme; },
  applyPrefs() {
    const e = document.documentElement, p = this.prefs;
    p.theme === 'system' ? e.removeAttribute('data-theme') : e.setAttribute('data-theme', p.theme);
    p.palette === 'maser' ? e.removeAttribute('data-palette') : e.setAttribute('data-palette', p.palette);
    p.density === 'comfortable' ? e.removeAttribute('data-density') : e.setAttribute('data-density', p.density);
    p.navLayout === 'side' ? e.removeAttribute('data-nav') : e.setAttribute('data-nav', p.navLayout);
  },
  setPref(k, v) {
    this.prefs = { ...this.prefs, [k]: v };
    try { localStorage.setItem('maser-prefs-v1', JSON.stringify(this.prefs)); } catch (_) {}
    this.applyPrefs();
    if (k === 'navLayout') { this.layout = v; this.mobileOpen = false; }
    // la coquille (menu) lit les pages activées
    if (k === 'optPages') this.optPages = v;
  },
  resetPrefs() {
    this.prefs = { theme: 'system', palette: 'maser', density: 'comfortable', taskView: 'board', navLayout: 'side', optPages: { tasks: false, tests: false, notes: false, amendments: false, meetings: false } };
    try { localStorage.setItem('maser-prefs-v1', JSON.stringify(this.prefs)); } catch (_) {}
    this.applyPrefs(); this.layout = 'side'; this.optPages = this.prefs.optPages;
  },

  // ----- sections par rôle -----
  get boss() { return this.user.supervisorId ? this.getMember(this.user.supervisorId) : null; },
  get belowCount() { return this.subs(this.user.id).length; },
  get delegates() { return this.members.filter((m) => m.role !== 'Client' && m.id !== this.user.id); },
  addAbsence() {
    const x = this.s.draft; if (!x.start || !x.end || x.end < x.start) return;
    this.s.absences = [...this.s.absences, { id: 'a' + Date.now(), ...x }].sort((p, q) => p.start.localeCompare(q.start));
    this.s.draft = { type: 'Annual leave', start: '', end: '', note: '' };
  },
  get clientContacts() {
    const mine = this.allProjects.filter((p) => p.client === this.user.company);
    return this.members.filter((m) => m.role === 'Manager' && mine.some((p) => p.memberIds.includes(m.id)))
      .map((m) => ({ m, codes: mine.filter((p) => p.memberIds.includes(m.id)).map((p) => p.code).join(', ') }));
  },
  get logAll() { let x = []; try { x = JSON.parse(localStorage.getItem('maser-log') || '[]'); } catch (_) {} return [...x, ...this.LOG.map((l, i) => ({ ...l, id: 'seed' + i }))]; },
  get logRows() { return this.logAll.filter((l) => this.s.logType === 'All' || l.type === this.s.logType); },
  exportData() {
    const data = { exportedAt: new Date().toISOString(), members: this.members, projects: this.allProjects, tasks: this.allTasks, tests: this.allTests, amendments: this.allAmendments, meetings: this.allMeetings, notes: this.allNotes };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'maser-engineering-export.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
});
