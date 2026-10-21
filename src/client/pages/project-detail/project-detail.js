// Project detail page: header, facts and tabs (Overview, Tasks, Tests, Gantt, Notes, Amendments, Meetings, Team).
// Markup: project-detail.html, one file per tab in tabs/. The Tasks, Tests, Notes, Amendments and Meetings
// tabs are nested components (tabs/*.js) that reuse the logic of the matching pages (features/).
// URL: ?id=p1&tab=tasks — the project id comes from core/router.js (projectId).
import moment from 'moment';
import { TODAY } from '../../core/demo-data.js';
import { TASK_BAR } from '../../core/tones.js';

export const projectDetail = () => ({
  tab: 'overview',
  // `file`: the standalone page with the same content (link "Open full page")
  tabs: [
    { id: 'overview', label: 'Overview' }, { id: 'tasks', label: 'Tasks', file: 'tasks.html' }, { id: 'tests', label: 'Tests', file: 'tests.html' },
    { id: 'gantt', label: 'Gantt' }, { id: 'notes', label: 'Notes', file: 'notes.html' }, { id: 'amendments', label: 'Amendments', file: 'amendments.html' },
    { id: 'meetings', label: 'Meetings', file: 'meetings.html' }, { id: 'team', label: 'Team' },
  ],

  init() {
    const t = this.params.get('tab');
    if (this.tabs.some((x) => x.id === t)) this.tab = t;
    // search: results of this project first, of the open tab's kind first
    this.usePage({ searchCtx: () => ({ project: this.projectId, kind: ({ tasks: 'task', tests: 'test', notes: 'note' })[this.tab] ?? null }) });
    if (this.project) document.title = this.project.name + ' · Maser Engineering';
  },
  setTab(id) {
    this.tab = id;
    this.replaceRoute(`project-detail.html?id=${this.projectId}&tab=${id}`);
  },
  get tabMeta() { return this.tabs.find((x) => x.id === this.tab); },
  get project() { return this.allProjects.find((p) => p.id === this.projectId); },

  // ---------- rights (rules in core/permissions.js) ----------
  get canView() {
    const p = this.project; if (!p) return false;
    if (this.role === 'Admin' || this.role === 'Manager') return true;
    if (this.role === 'Client') return !!this.user.company && p.client === this.user.company;
    return this.access(p);
  },
  get editable() { return !!this.project && this.canEdit(this.projectId); },
  get canLeadProject() { return this.canLead(this.project); },
  // assign the project lead (Team tab): Admin, or a manager leading this project
  get canAssign() { return this.role === 'Admin' || (this.role === 'Manager' && this.canLeadProject); },
  setLead(memberId) { if (this.project && this.canAssign) this.toggleLead(this.project, memberId); },

  // ---------- this project's data (also used by the tabs) ----------
  get pTasks() { return this.allTasks.filter((t) => t.projectId === this.projectId); },
  get pTests() { return this.allTests.filter((t) => t.projectId === this.projectId); },
  get approved() { return this.allAmendments.filter((a) => a.projectId === this.projectId && a.status === 'Approved'); },
  get amendedBudget() { return this.project.budget + this.approved.reduce((s, a) => s + a.amount, 0); },
  get team() { return this.members.filter((m) => this.project.memberIds.includes(m.id)); },
  get left() { return this.daysUntil(this.project.endDate); },
  // ---------- header and Overview tab ----------
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
  // Team tab: who a member reports to
  bossOf(m) { return m.supervisorId ? this.getMember(m.supervisorId) : null; },

  // ---------- Gantt tab: the project's tasks and milestones on a monthly timeline ----------
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
