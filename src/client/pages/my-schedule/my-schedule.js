// My Schedule page (Collaborator): my assignments by project and period, plus my upcoming
// tasks and meetings grouped by day.
// Schedule logic: features/staff-schedule.js. Markup: my-schedule.html.
import moment from 'moment';
import { compose } from '../../core/compose.js';
import { TODAY } from '../../core/demo-data.js';
import { staffSchedule } from '../../features/staff-schedule.js';

export default () => compose(staffSchedule(), {
  // collaborators only, on their own row
  get canSeePage() { return this.role === 'Collaborator'; },
  get staff() { return this.role === 'Collaborator' ? [this.user] : []; },
  pageDescription: 'Your assignments by project and period, with your upcoming tasks and meetings.',

  // ---------- my agenda: open tasks + upcoming meetings, grouped by day ----------
  get agenda() {
    const mine = this.tasks.filter((t) => t.assigneeId === this.user.id && t.status !== 'Done').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const mm = this.meetings.filter((m) => m.attendeeIds.includes(this.user.id) && m.start.slice(0, 10) >= TODAY).sort((a, b) => a.start.localeCompare(b.start));
    const items = [
      ...mine.map((t) => ({ key: t.id, date: t.dueDate, kind: 'task', title: t.title, sub: `Task · ${t.status} · due ${this.fd(t.dueDate)}`, projectId: t.projectId, late: t.dueDate < TODAY })),
      ...mm.map((m) => ({ key: m.id, date: m.start.slice(0, 10), kind: 'meeting', title: m.title, sub: `Meeting · ${m.start.slice(11, 16)} · ${m.durationMin} min · ${m.location}`, projectId: m.projectId })),
    ].sort((a, b) => a.date.localeCompare(b.date) || (a.kind === 'meeting' ? -1 : 1));
    const groups = [];
    for (const it of items) {
      let g = groups.find((x) => x.date === it.date);
      if (!g) { g = { date: it.date, today: it.date === TODAY, overdue: it.date < TODAY, label: it.date === TODAY ? 'Today' : moment(it.date).format('ddd, D MMM'), items: [] }; groups.push(g); }
      g.items.push(it);
    }
    return groups;
  },
  dotClass(i) { return i.kind === 'meeting' ? 'bg-chart-5' : i.late ? 'bg-destructive' : 'bg-primary'; },
});
