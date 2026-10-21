// Page « Planning des équipes » (maquette : mocks/team-schedule.html)
import moment from 'moment';
import { TODAY } from '../data/demo.js';

export default () => ({
  view: 'timeline', filter: 'active',
  PROJECT_COLORS: ['var(--primary)', 'var(--success)', 'var(--chart-5)', 'oklch(.62 .14 70)', '#4f4c4d', 'var(--muted-foreground)'],
  PHASE_TONE: { Current: 'bg-success/12 text-success-ink border-success/25', Upcoming: 'bg-alt/12 text-alt-ink border-alt/25', Completed: 'bg-muted-foreground/12 text-muted-ink border-muted-foreground/25' },

  // accès : Admin (tout le monde) et Manager (lui-même + sa hiérarchie)
  get canSeePage() { return this.role === 'Admin' || this.role === 'Manager'; },
  get staff() {
    if (this.role === 'Admin') return this.members.filter((m) => m.role !== 'Client');
    if (this.role === 'Manager') return [this.user, ...this.subs(this.user.id)];
    return [];
  },
  get pageDescription() {
    return this.role === 'Admin'
      ? 'Who is working on which project, and over which period. Admin view of staff allocation.'
      : 'Who is working on which project, and over which period, for you and the people reporting to you.';
  },
  phase(a) { return a.end < TODAY ? 'Completed' : a.start > TODAY ? 'Upcoming' : 'Current'; },
  colorOf(pid) { return this.PROJECT_COLORS[Math.max(0, this.projects.findIndex((p) => p.id === pid)) % this.PROJECT_COLORS.length]; },
  get filterOptions() {
    return [{ value: 'active', label: 'Active projects' }, { value: 'all', label: 'All projects' }, ...this.projects.map((p) => ({ value: p.id, label: `${p.code} · ${p.name}` }))];
  },

  // Affectations calculées à partir des tâches (période = première date de début → dernière échéance)
  get sched() {
    const LANE = 28, DAY = 86400000, ms = (d) => new Date(d + 'T00:00:00').getTime();
    const shown = this.projects.filter((p) => (this.filter === 'active' ? p.status === 'In Progress' : this.filter === 'all' ? true : p.id === this.filter));
    const rows = this.staff.map((m) => {
      const list = [];
      for (const p of shown) {
        const mine = this.tasks.filter((t) => t.projectId === p.id && t.assigneeId === m.id);
        if (mine.length) {
          list.push({ memberId: m.id, projectId: p.id, start: mine.reduce((a, t) => (t.startDate < a ? t.startDate : a), mine[0].startDate), end: mine.reduce((a, t) => (t.dueDate > a ? t.dueDate : a), mine[0].dueDate), tasks: mine.length, fromTasks: true });
        } else if (p.memberIds.includes(m.id)) {
          list.push({ memberId: m.id, projectId: p.id, start: p.startDate, end: p.endDate, tasks: 0, fromTasks: false });
        }
      }
      list.sort((a, b) => a.start.localeCompare(b.start));
      const laneEnds = [];
      const placed = list.map((a) => { let lane = laneEnds.findIndex((e) => e < a.start); if (lane === -1) lane = laneEnds.length; laneEnds[lane] = a.end; return { ...a, lane }; });
      return { member: m, assignments: placed, lanes: Math.max(1, laneEnds.length) };
    });
    const all = rows.flatMap((r) => r.assignments);
    const out = { rows, all, count: all.length, current: rows.filter((r) => r.assignments.some((a) => this.phase(a) === 'Current')).length, people: rows.length };
    if (!all.length) return out;

    // liste
    out.flat = rows.flatMap((r) => r.assignments.map((a) => ({ ...a, member: r.member, p: this.getProject(a.projectId), ph: this.phase(a) })))
      .sort((a, b) => a.member.name.localeCompare(b.member.name) || a.start.localeCompare(b.start));

    // chronologie
    const dates = [...all.flatMap((a) => [a.start, a.end]), TODAY];
    const dMin = new Date(dates.reduce((a, b) => (a < b ? a : b)) + 'T00:00:00'), dMax = new Date(dates.reduce((a, b) => (a > b ? a : b)) + 'T00:00:00');
    const rs = new Date(dMin.getFullYear(), dMin.getMonth(), 1), re = new Date(dMax.getFullYear(), dMax.getMonth() + 1, 1);
    const span = re - rs, pct = (d) => ((ms(d) - rs) / span) * 100;
    out.months = [];
    for (let d = new Date(rs); d < re; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) out.months.push({ label: moment(d).format('MMM YY'), left: ((d - rs) / span) * 100 });
    out.todayPct = pct(TODAY);
    out.minWidth = Math.max(720, Math.round(span / DAY) * 6);
    out.legend = Array.from(new Set(all.map((a) => a.projectId))).map((id) => this.getProject(id));
    out.tl = rows.map((r) => {
      const now = r.assignments.filter((a) => this.phase(a) === 'Current').length;
      return {
        member: r.member, height: r.lanes * LANE + 16, now, status: now ? `${now} project${now > 1 ? 's' : ''} now` : 'Available',
        bars: r.assignments.map((a) => {
          const p = this.getProject(a.projectId), c = this.colorOf(a.projectId), left = pct(a.start);
          return {
            key: a.projectId, p, left, width: Math.max(pct(a.end) - left, 1), top: 8 + a.lane * LANE + 2,
            bg: a.fromTasks ? c : `repeating-linear-gradient(135deg, ${c} 0 6px, color-mix(in oklch, ${c} 60%, transparent) 6px 12px)`,
            title: `${p.name} · ${this.fd(a.start)} → ${this.fd(a.end)} · ${a.tasks ? a.tasks + ' task' + (a.tasks > 1 ? 's' : '') : 'no task yet'}`,
            aria: `${r.member.name} on ${p.name}: ${this.fd(a.start, 'D MMM YYYY')} to ${this.fd(a.end, 'D MMM YYYY')}`,
          };
        }),
      };
    });
    return out;
  },
});
