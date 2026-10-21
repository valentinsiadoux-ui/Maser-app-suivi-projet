// Page « Détail d'un projet » (maquette : mocks/project-detail.html)
import moment from 'moment';
import { TODAY } from '../data/demo.js';
import { TASK_BAR } from '../constants.js';

export const projectDetail = () => ({
  tab: 'overview',
  tabs: [
    { id: 'overview', label: 'Overview' }, { id: 'tasks', label: 'Tasks', file: 'tasks.html' }, { id: 'tests', label: 'Tests', file: 'tests.html' },
    { id: 'gantt', label: 'Gantt' }, { id: 'notes', label: 'Notes', file: 'notes.html' }, { id: 'amendments', label: 'Amendments', file: 'amendments.html' },
    { id: 'meetings', label: 'Meetings', file: 'meetings.html' }, { id: 'team', label: 'Team' },
  ],
  // chef de projet : surcharge locale partagée entre les pages (localStorage)
  leads: (() => { try { return JSON.parse(localStorage.getItem('maser-leads') || '{}'); } catch (_) { return {}; } })(),
  // projectId : fourni par la route (?id=…)
  init() {
    const t = this.params.get('tab');
    if (this.tabs.some((x) => x.id === t)) this.tab = t;
    this.usePage({ searchCtx: () => this.searchCtx });
    if (this.project) document.title = this.project.name + ' · Maser Engineering';
  },
  setTab(id) {
    this.tab = id;
    this.replaceRoute(`project-detail.html?id=${this.projectId}&tab=${id}`);
  },

  get searchCtx() { return { project: this.projectId, kind: ({ tasks: 'task', tests: 'test', notes: 'note' })[this.tab] ?? null }; },
  get project() { return this.allProjects.find((p) => p.id === this.projectId); },
  leadOf(p) { return this.leads[p.id] ?? null; },
  // droits (même logique que le prototype)
  get group() { return [this.user, ...this.subs(this.user.id)]; },
  get canView() {
    const p = this.project; if (!p) return false;
    if (this.role === 'Admin' || this.role === 'Manager') return true;
    if (this.role === 'Client') return !!this.user.company && p.client === this.user.company;
    return this.access(p);
  },
  get editable() {
    const p = this.project; if (!p) return false;
    if (this.role === 'Admin') return true;
    if (this.role === 'Client') return false;
    return this.access(p);
  },
  get canLeadProject() {
    const p = this.project; if (!p) return false;
    if (this.role === 'Admin') return true;
    return this.group.some((m) => (this.eff(m) === 'Manager' && p.memberIds.includes(m.id)) || this.leadOf(p) === m.id);
  },
  get canAssign() { return this.role === 'Admin' || (this.role === 'Manager' && this.canLeadProject); },
  setLead(memberId) {
    const p = this.project; if (!p || !this.canAssign) return;
    const next = { ...this.leads };
    if (memberId && next[p.id] !== memberId) next[p.id] = memberId; else delete next[p.id];
    this.leads = next;
    localStorage.setItem('maser-leads', JSON.stringify(next));
  },

  get pTasks() { return this.allTasks.filter((t) => t.projectId === this.projectId); },
  get pTests() { return this.allTests.filter((t) => t.projectId === this.projectId); },
  get approved() { return this.allAmendments.filter((a) => a.projectId === this.projectId && a.status === 'Approved'); },
  get amendedBudget() { return this.project.budget + this.approved.reduce((s, a) => s + a.amount, 0); },
  get team() { return this.members.filter((m) => this.project.memberIds.includes(m.id)); },
  get left() { return this.daysUntil(this.project.endDate); },
  eur(n) { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n); },
  get facts() {
    const p = this.project;
    return [
      { label: 'Client', value: p.client },
      { label: 'Start', value: this.fd(p.startDate, 'D MMM YYYY') },
      { label: 'Target end', value: this.fd(p.endDate, 'D MMM YYYY') },
      { label: 'Budget', value: this.eur(this.amendedBudget), sub: this.approved.length ? `incl. ${this.approved.length} avenant(s)` : '' },
    ];
  },
  get stats() {
    const T = this.pTasks, Q = this.pTests;
    return [
      { label: 'Tasks', value: `${T.filter((t) => t.status === 'Done').length}/${T.length}`, sub: 'completed', go: 'tasks' },
      { label: 'In review', value: T.filter((t) => t.status === 'Review').length, sub: 'tasks', go: 'tasks' },
      { label: 'Tests passed', value: `${Q.filter((t) => t.status === 'Passed').length}/${Q.length}`, sub: 'cases', go: 'tests' },
      { label: 'Failed tests', value: Q.filter((t) => t.status === 'Failed').length, sub: 'to investigate', go: 'tests' },
    ];
  },
  get remaining() {
    const p = this.project;
    if (p.status !== 'In Progress') return 'Project closed';
    return this.left >= 0 ? `${this.left} days remaining` : `${Math.abs(this.left)} days overdue`;
  },
  bossOf(m) { return m.supervisorId ? this.getMember(m.supervisorId) : null; },
  get tabMeta() { return this.tabs.find((x) => x.id === this.tab); },

  // ---------- Gantt du projet (calculé comme dans le prototype) ----------
  get gantt() {
    const p = this.project; if (!p) return null;
    const DAY = 86400000, ms = (d) => new Date(d + 'T00:00:00').getTime();
    const prog = (s) => (s === 'Done' ? 100 : s === 'Review' ? 75 : s === 'In Progress' ? 40 : 0);
    const rows = this.pTasks.slice().sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map((t) => ({ id: t.id, label: t.title, sub: this.getMember(t.assigneeId)?.name, start: t.startDate, end: t.dueDate, progress: prog(t.status), tone: TASK_BAR[t.status] }));
    const miles = this.milestones.filter((m) => m.projectId === p.id);
    if (!rows.length) return { rows: [] };
    const all = [...rows.flatMap((r) => [r.start, r.end]), ...miles.map((m) => m.date)];
    const dMin = new Date(all.reduce((a, b) => (a < b ? a : b)) + 'T00:00:00'), dMax = new Date(all.reduce((a, b) => (a > b ? a : b)) + 'T00:00:00');
    const rs = new Date(dMin.getFullYear(), dMin.getMonth(), 1), re = new Date(dMax.getFullYear(), dMax.getMonth() + 1, 1);
    const span = re - rs, pct = (d) => ((ms(d) - rs) / span) * 100;
    const months = [];
    for (let d = new Date(rs); d < re; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      months.push({ label: moment(d).format('MMM YY'), left: ((d - rs) / span) * 100, width: ((next - d) / span) * 100 });
    }
    return {
      rows: rows.map((r) => ({ ...r, left: pct(r.start), width: Math.max(pct(r.end) - pct(r.start), 0.8),
        title: `${this.fd(r.start)} → ${this.fd(r.end)} · ${r.progress}%` })),
      miles: miles.map((m) => ({ ...m, left: pct(m.date), title: `${m.title} · ${this.fd(m.date, 'D MMM YYYY')}` })),
      months, todayPct: pct(TODAY), minWidth: Math.max(720, Math.round(span / DAY) * 7),
    };
  },
});

// ================= Onglets du projet (même logique que les pages dédiées, filtrée sur ce projet) =================
// Chaque onglet est un composant imbriqué : il hérite des données et des droits de la page (project, editable, …).
export const tasksTab = () => ({
  STATUSES: ['To Do', 'In Progress', 'Review', 'Done'],
  COL_ACCENT: { 'To Do': 'bg-muted-foreground/40', 'In Progress': 'bg-primary', Review: 'bg-warning', Done: 'bg-success' },
  view: (() => { try { return JSON.parse(localStorage.getItem('maser-prefs-v1') || '{}').taskView || 'board'; } catch (_) { return 'board'; } })(),
  priorityFilter: 'All', mine: false, dragOver: null,
  menu: { open: false, x: 0, y: 0, taskId: null, edit: false },
  dialog: { open: false, mode: 'add', taskId: null },
  tform: { title: '', status: 'To Do', priority: 'Medium', assigneeId: '', startDate: '2026-10-19', dueDate: '2026-11-06' },
  init() { this.mine = this.role === 'Collaborator'; },
  closeLocal() { this.dialog.open = false; this.menu.open = false; },
  get canAdd() { return this.editable; },
  get visible() {
    return this.pTasks.filter((t) => (this.priorityFilter === 'All' || t.priority === this.priorityFilter) && (!this.mine || t.assigneeId === this.user.id));
  },
  by(status) { return this.visible.filter((t) => t.status === status); },
  isLate(t) { return t.status !== 'Done' && this.daysUntil(t.dueDate) < 0; },
  persist() { try { localStorage.setItem('maser-tasks', JSON.stringify(this.allTasks)); } catch (_) {} },
  setStatus(id, status) {
    const t = this.allTasks.find((x) => x.id === id);
    if (!t || !this.editable || t.projectId !== this.project.id) return;
    this.allTasks = this.allTasks.map((x) => (x.id === id ? { ...x, status } : x));
    this.persist();
  },
  drop(e, status) {
    const id = e.dataTransfer.getData('text/task');
    if (this.visible.some((x) => x.id === id)) this.setStatus(id, status);
    this.dragOver = null;
  },
  openMenu(ev, task, withEdit, align) {
    const r = ev.currentTarget.getBoundingClientRect(), w = 176;
    const x = align === 'end' ? r.right - w : r.left;
    this.menu = { open: true, taskId: task.id, edit: withEdit, x: Math.max(8, Math.min(x, window.innerWidth - w - 8)), y: r.bottom + 4 };
  },
  get menuTask() { return this.allTasks.find((x) => x.id === this.menu.taskId); },
  get formTeam() { const p = this.project; return this.members.filter((m) => m.role !== 'Client' && (p.memberIds.includes(m.id) || m.id === this.tform.assigneeId)); },
  get validTask() { const f = this.tform; return f.title.trim() && f.assigneeId && f.dueDate >= f.startDate; },
  openAdd(status) {
    this.menu.open = false;
    this.tform = { title: '', status, priority: 'Medium', assigneeId: this.project.memberIds.find((id) => this.getMember(id)?.role !== 'Client') || '', startDate: '2026-10-19', dueDate: '2026-11-06' };
    this.dialog = { open: true, mode: 'add', taskId: null };
    this.$nextTick(() => this.$refs.ttitle && this.$refs.ttitle.focus());
  },
  openEdit(task) {
    this.menu.open = false;
    this.tform = { title: task.title, status: task.status, priority: task.priority, assigneeId: task.assigneeId, startDate: task.startDate, dueDate: task.dueDate };
    this.dialog = { open: true, mode: 'edit', taskId: task.id };
    this.$nextTick(() => this.$refs.ttitle && this.$refs.ttitle.focus());
  },
  submitTask() {
    if (!this.validTask || !this.editable) return;
    const f = this.tform;
    if (this.dialog.mode === 'add') {
      this.allTasks = [...this.allTasks, { id: 't' + Date.now(), projectId: this.project.id, title: f.title.trim(), status: f.status, priority: f.priority, assigneeId: f.assigneeId, startDate: f.startDate, dueDate: f.dueDate }];
    } else {
      this.allTasks = this.allTasks.map((x) => (x.id === this.dialog.taskId ? { ...x, title: f.title.trim(), status: f.status, priority: f.priority, assigneeId: f.assigneeId, startDate: f.startDate, dueDate: f.dueDate } : x));
    }
    this.persist(); this.dialog.open = false;
  },
});

export const testsTab = () => ({
  RESULTS: ['Passed', 'Failed', 'Pending'],
  statusFilter: 'All',
  menu: { open: false, x: 0, y: 0, testId: null },
  STAT_CARDS: [
    { key: 'Passed', icon: 'circle-check', tone: 'text-success', bar: 'bg-success' },
    { key: 'Failed', icon: 'circle-x', tone: 'text-destructive', bar: 'bg-destructive' },
    { key: 'Pending', icon: 'circle-dashed', tone: 'text-warning-foreground', bar: 'bg-warning' },
  ],
  closeLocal() { this.menu.open = false; },
  get scopedTests() { return this.pTests; },
  get visibleTests() { return this.scopedTests.filter((t) => this.statusFilter === 'All' || t.status === this.statusFilter); },
  count(s) { return this.scopedTests.filter((t) => t.status === s).length; },
  pctOf(s) { return Math.round((this.count(s) / (this.scopedTests.length || 1)) * 100); },
  toggleStatus(k) { this.statusFilter = this.statusFilter === k ? 'All' : k; },
  get campaigns() { return Array.from(new Set(this.scopedTests.map((t) => t.campaign))); },
  get groups() {
    return this.campaigns.map((campaign) => {
      const rows = this.visibleTests.filter((t) => t.campaign === campaign);
      const all = this.scopedTests.filter((t) => t.campaign === campaign);
      return { key: campaign, campaign, rows, passed: all.filter((t) => t.status === 'Passed').length, total: all.length };
    }).filter((g) => g.rows.length > 0);
  },
  persist() { try { localStorage.setItem('maser-tests', JSON.stringify(this.allTests)); } catch (_) {} },
  setResult(id, status) {
    const t = this.allTests.find((x) => x.id === id);
    if (!t || !this.editable || t.projectId !== this.project.id) return;
    this.allTests = this.allTests.map((x) => (x.id === id ? { ...x, status, lastRun: TODAY } : x));
    this.persist();
  },
  openMenu(ev, test) {
    const r = ev.currentTarget.getBoundingClientRect(), w = 176;
    this.menu = { open: true, testId: test.id, x: Math.max(8, Math.min(r.left, window.innerWidth - w - 8)), y: r.bottom + 4 };
  },
  get menuTest() { return this.allTests.find((x) => x.id === this.menu.testId); },
});

export const notesTab = () => ({
  CATEGORIES: ['Technical', 'Site Visit', 'Decision', 'Client'],
  filter: 'All', category: 'Technical', draft: '',
  editing: { id: null, content: '' }, openComments: {}, drafts: {},
  init() { this.pool.forEach((n) => { if ((n.comments || []).length) this.openComments[n.id] = true; }); },
  get pool() { return this.notes.filter((n) => n.projectId === this.project.id); },
  get visibleNotes() { return this.pool.filter((n) => this.filter === 'All' || n.category === this.filter); },
  countOf(c) { return this.pool.filter((n) => c === 'All' || n.category === c).length; },
  canEditNote(n) { return n.authorId === this.user.id || this.role === 'Admin'; },
  canComment() { return this.role === 'Client' || this.editable; },
  nowIso() { return TODAY + 'T' + moment().format('HH:mm:ss'); },
  persist() { try { localStorage.setItem('maser-notes', JSON.stringify(this.allNotes)); } catch (_) {} },
  post() {
    const text = this.draft.trim(); if (!text || !this.editable) return;
    this.allNotes = [{ id: 'n' + Date.now(), projectId: this.project.id, authorId: this.user.id, category: this.category, content: text, createdAt: this.nowIso(), comments: [] }, ...this.allNotes];
    this.draft = ''; this.persist();
  },
  startEdit(n) { this.editing = { id: n.id, content: n.content }; },
  saveEdit() {
    const c = this.editing.content.trim(); if (!c) return;
    this.allNotes = this.allNotes.map((x) => (x.id === this.editing.id ? { ...x, content: c } : x));
    this.editing = { id: null, content: '' }; this.persist();
  },
  remove(n) { this.allNotes = this.allNotes.filter((x) => x.id !== n.id); this.persist(); },
  toggleComments(n) { this.openComments = { ...this.openComments, [n.id]: !this.openComments[n.id] }; },
  postComment(n) {
    const text = (this.drafts[n.id] || '').trim(); if (!text || !this.canComment()) return;
    this.allNotes = this.allNotes.map((x) => (x.id === n.id ? { ...x, comments: [...(x.comments || []), { id: 'c' + Date.now(), authorId: this.user.id, content: text, createdAt: this.nowIso() }] } : x));
    this.drafts = { ...this.drafts, [n.id]: '' }; this.persist();
  },
});

export const amendmentsTab = () => ({
  TYPES: ['Scope', 'Schedule', 'Budget'],
  dialog: { open: false },
  aform: { title: '', type: 'Scope', amount: '', days: '' },
  closeLocal() { this.dialog.open = false; },
  get list() { return this.allAmendments.filter((a) => a.projectId === this.project.id); },
  get rows() { return [...this.list].reverse(); },
  get totals() {
    const L = this.list, ok = L.filter((a) => a.status === 'Approved');
    return [
      { label: 'Approved budget impact', value: this.eur(ok.reduce((s, a) => s + a.amount, 0)) },
      { label: 'Approved schedule impact', value: `+${ok.reduce((s, a) => s + a.daysImpact, 0)} days` },
      { label: 'Awaiting approval', value: String(L.filter((a) => a.status === 'Pending Approval').length) },
      { label: 'Drafts', value: String(L.filter((a) => a.status === 'Draft').length) },
    ];
  },
  persist() { try { localStorage.setItem('maser-amendments', JSON.stringify(this.allAmendments)); } catch (_) {} },
  setStatus(a, status) { this.allAmendments = this.allAmendments.map((x) => (x.id === a.id ? { ...x, status } : x)); this.persist(); },
  submitAmendment(a) { if (a.status === 'Draft') this.setStatus(a, 'Pending Approval'); },
  approve(a) { if (a.status === 'Pending Approval' && this.canLeadProject) this.setStatus(a, 'Approved'); },
  get validAmendment() { return this.aform.title.trim(); },
  openNew() {
    this.aform = { title: '', type: 'Scope', amount: '', days: '' };
    this.dialog.open = true;
    this.$nextTick(() => this.$refs.atitle && this.$refs.atitle.focus());
  },
  saveAmendment() {
    if (!this.validAmendment) return;
    const f = this.aform, pid = this.project.id, n = this.allAmendments.filter((x) => x.projectId === pid).length + 1;
    this.allAmendments = [...this.allAmendments, {
      id: 'a' + Date.now(), projectId: pid, ref: 'AV-' + String(n).padStart(3, '0'), title: f.title.trim(), type: f.type,
      status: 'Draft', amount: Number(f.amount) || 0, daysImpact: Number(f.days) || 0, requestedBy: this.user.id, createdAt: TODAY,
    }];
    this.persist(); this.dialog.open = false;
  },
});

export const meetingsTab = () => ({
  DURATIONS: [{ v: '30', l: '30 minutes' }, { v: '45', l: '45 minutes' }, { v: '60', l: '1 hour' }, { v: '90', l: '1.5 hours' }, { v: '120', l: '2 hours' }],
  dialog: { open: false },
  mform: { title: '', start: '2026-10-23T10:00', duration: '60', location: 'Google Meet' },
  closeLocal() { this.dialog.open = false; },
  get list() { return this.meetings.filter((m) => m.projectId === this.project.id).sort((a, b) => a.start.localeCompare(b.start)); },
  get upcoming() { return this.list.filter((m) => m.start.slice(0, 10) >= TODAY); },
  get past() { return this.list.filter((m) => m.start.slice(0, 10) < TODAY).reverse(); },
  isOnline(m) { return /meet|teams|zoom/i.test(m.location); },
  get canSchedule() { return this.canLeadProject; },
  persist() { try { localStorage.setItem('maser-meetings', JSON.stringify(this.allMeetings)); } catch (_) {} },
  get validMeeting() { return this.mform.title.trim() && this.mform.start; },
  openSchedule() {
    this.mform = { title: '', start: '2026-10-23T10:00', duration: '60', location: 'Google Meet' };
    this.dialog.open = true;
    this.$nextTick(() => this.$refs.mtitle && this.$refs.mtitle.focus());
  },
  gcalDate(local, addMin = 0) { return new Date(new Date(local).getTime() + addMin * 60000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); },
  saveMeeting() {
    if (!this.validMeeting || !this.canSchedule) return;
    const f = this.mform, p = this.project, durationMin = Number(f.duration) || 60;
    this.allMeetings = [...this.allMeetings, { id: 'm' + Date.now(), projectId: p.id, title: f.title.trim(), start: f.start + ':00', durationMin, location: f.location, attendeeIds: p.memberIds.slice(0, 4) }];
    this.persist();
    const params = new URLSearchParams({ action: 'TEMPLATE', text: `${f.title.trim()} — ${p.name}`, dates: `${this.gcalDate(f.start)}/${this.gcalDate(f.start, durationMin)}`, details: `Maser Engineering project meeting (${p.code})`, location: f.location });
    window.open('https://calendar.google.com/calendar/render?' + params.toString(), '_blank', 'noopener,noreferrer');
    this.dialog.open = false;
  },
});
