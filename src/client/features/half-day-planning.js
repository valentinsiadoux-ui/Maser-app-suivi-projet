// Half-day planning: who works on which project, each morning (AM) and afternoon (PM).
// Used by Team Schedule (pages/team-schedule/half-day-grid.js) and My Schedule (pages/my-schedule/my-week.js).
//
// A "slot" is a run of half-days for one person:
//   { id, personId, kind: 'work' | 'leave', projectId, taskId, label, a, b, status: 'planned' | 'proposed' }
// where a and b are half-day indexes (see hdIdx). Slots are saved by core/store.js (planningSlots),
// the planning options too (planningOpts: allowShare, selfPlan, source).
import moment from 'moment';

// ---------- half-day index: 2 × (days since 1 January 2026) + 1 for the afternoon ----------
const HD_BASE = Date.UTC(2026, 0, 1), HD_DAY = 86400000;
export const hdIdx = (date, half) => Math.round((Date.parse(date + 'T00:00:00Z') - HD_BASE) / HD_DAY) * 2 + (half === 'PM' ? 1 : 0);
export const hdDate = (i) => new Date(HD_BASE + Math.floor(i / 2) * HD_DAY).toISOString().slice(0, 10);
export const hdHalf = (i) => (i % 2 ? 'PM' : 'AM');
export const hdAdd = (date, n) => new Date(Date.parse(date + 'T00:00:00Z') + n * HD_DAY).toISOString().slice(0, 10);
export const hdDow = (date) => new Date(date + 'T00:00:00Z').getUTCDay();
export const hdWeekend = (i) => [0, 6].includes(hdDow(hdDate(i)));
export const hdMonday = (date) => hdAdd(date, -((hdDow(date) + 6) % 7));
export const hdFmt = (date, f = 'ddd D MMM') => moment(date).format(f);
export const HD_COLORS = ['var(--primary)', 'var(--success)', 'var(--chart-5)', 'oklch(.62 .14 70)', '#4f4c4d', 'var(--muted-foreground)'];
export const HD_LEAVE = 'repeating-linear-gradient(135deg, color-mix(in oklch, var(--muted-foreground) 45%, transparent) 0 5px, color-mix(in oklch, var(--muted-foreground) 20%, transparent) 5px 10px)';
let hdN = 0;
export const hdId = () => 'h' + (++hdN) + Math.floor(Math.random() * 99999);
// number of half-days two slots have in common
export const hdOverlap = (x, y) => Math.max(0, Math.min(x.b, y.b) - Math.max(x.a, y.a) + 1);

// demo planning (same as the mockups)
export function hdSeed() {
  let n = 0;
  const S = (person, project, d1, h1, d2, h2, extra = {}) => ({ id: 'seed' + (++n), personId: person, kind: 'work', projectId: project, taskId: null, a: hdIdx(d1, h1), b: hdIdx(d2, h2), status: 'planned', ...extra });
  const L = (person, d1, h1, d2, h2, label) => ({ id: 'seed' + (++n), personId: person, kind: 'leave', label, projectId: null, taskId: null, a: hdIdx(d1, h1), b: hdIdx(d2, h2), status: 'planned' });
  return [
    S('u2', 'p1', '2026-10-12', 'AM', '2026-10-14', 'PM'), S('u2', 'p3', '2026-10-15', 'AM', '2026-10-15', 'PM'),
    S('u2', 'p1', '2026-10-16', 'AM', '2026-10-16', 'AM'), S('u2', 'p3', '2026-10-16', 'PM', '2026-10-16', 'PM'),
    S('u2', 'p1', '2026-10-19', 'AM', '2026-10-19', 'PM'), S('u2', 'p3', '2026-10-20', 'AM', '2026-10-22', 'PM'),
    S('u2', 'p1', '2026-10-23', 'AM', '2026-10-23', 'PM'), S('u2', 'p1', '2026-10-26', 'AM', '2026-10-27', 'PM'), S('u2', 'p3', '2026-10-28', 'AM', '2026-10-30', 'PM'),
    S('u3', 'p2', '2026-10-12', 'AM', '2026-10-13', 'PM'), S('u3', 'p1', '2026-10-14', 'AM', '2026-10-14', 'PM', { taskId: 't3' }),
    S('u3', 'p4', '2026-10-15', 'AM', '2026-10-16', 'PM'), S('u3', 'p1', '2026-10-15', 'PM', '2026-10-15', 'PM'),
    S('u3', 'p2', '2026-10-19', 'AM', '2026-10-21', 'PM'), S('u3', 'p4', '2026-10-22', 'AM', '2026-10-23', 'PM'),
    S('u3', 'p1', '2026-10-26', 'AM', '2026-10-27', 'PM'), S('u3', 'p2', '2026-10-28', 'AM', '2026-10-30', 'PM'),
    S('u4', 'p3', '2026-10-12', 'AM', '2026-10-12', 'PM'), S('u4', 'p2', '2026-10-13', 'AM', '2026-10-14', 'PM'),
    S('u4', 'p1', '2026-10-15', 'AM', '2026-10-15', 'PM'), S('u4', 'p2', '2026-10-16', 'AM', '2026-10-16', 'AM'), S('u4', 'p1', '2026-10-16', 'PM', '2026-10-16', 'PM'),
    S('u4', 'p1', '2026-10-19', 'AM', '2026-10-19', 'PM'), L('u4', '2026-10-20', 'PM', '2026-10-21', 'PM', 'Annual leave'),
    S('u4', 'p3', '2026-10-22', 'AM', '2026-10-23', 'PM'), S('u4', 'p2', '2026-10-26', 'AM', '2026-10-27', 'PM'), S('u4', 'p1', '2026-10-28', 'AM', '2026-10-30', 'PM'),
    S('u5', 'p1', '2026-10-12', 'AM', '2026-10-14', 'PM'), S('u5', 'p3', '2026-10-15', 'AM', '2026-10-15', 'PM'), S('u5', 'p1', '2026-10-16', 'AM', '2026-10-16', 'AM'),
    S('u5', 'p1', '2026-10-19', 'AM', '2026-10-21', 'PM'), S('u5', 'p3', '2026-10-22', 'AM', '2026-10-23', 'PM'),
    S('u5', 'p1', '2026-10-26', 'AM', '2026-10-28', 'PM'), S('u5', 'p3', '2026-10-29', 'AM', '2026-10-30', 'PM'),
    S('u6', 'p2', '2026-10-12', 'AM', '2026-10-13', 'PM'), S('u6', 'p4', '2026-10-14', 'AM', '2026-10-16', 'PM'),
    S('u6', 'p2', '2026-10-19', 'AM', '2026-10-20', 'PM'), S('u6', 'p4', '2026-10-21', 'AM', '2026-10-23', 'PM'),
    S('u6', 'p2', '2026-10-26', 'AM', '2026-10-27', 'PM'), S('u6', 'p4', '2026-10-28', 'AM', '2026-10-30', 'PM'),
  ];
}
// merge contiguous identical slots
export function hdMerge(slots) {
  const key = (s) => [s.personId, s.kind, s.projectId, s.taskId, s.status, s.label].join('|');
  const sorted = [...slots].sort((x, y) => key(x).localeCompare(key(y)) || x.a - y.a), out = [];
  for (const s of sorted) { const p = out[out.length - 1]; if (p && key(p) === key(s) && s.a === p.b + 1) p.b = s.b; else out.push({ ...s }); }
  return out;
}
// set (or clear, when val is null) ONE half-day; pred chooses which slots may be cut
export function hdSetHalf(slots, personId, i, val, pred = () => true, status = 'planned') {
  const out = [];
  for (const s of slots) {
    if (s.personId !== personId || i < s.a || i > s.b || !pred(s)) { out.push(s); continue; }
    if (s.a < i) out.push({ ...s, id: hdId(), b: i - 1 });
    if (s.b > i) out.push({ ...s, id: hdId(), a: i + 1 });
  }
  if (val) out.push({ id: hdId(), personId, kind: val.kind, projectId: val.kind === 'work' ? val.projectId : null, taskId: val.taskId || null, label: val.kind === 'leave' ? 'Annual leave' : undefined, a: i, b: i, status });
  return hdMerge(out);
}
// add a half-day on a project WITHOUT removing the rest (shared half-day)
export function hdAddHalf(slots, personId, i, projectId, status = 'planned') {
  if (slots.some((s) => s.personId === personId && s.kind === 'work' && s.projectId === projectId && s.a <= i && i <= s.b)) return slots;
  return hdMerge([...slots, { id: hdId(), personId, kind: 'work', projectId, taskId: null, a: i, b: i, status }]);
}
// state of a half-day for a person: free · work · leave · conflict
export function hdCell(slots, pid, i) {
  const w = slots.filter((s) => s.personId === pid && s.kind === 'work' && s.a <= i && i <= s.b), l = slots.find((s) => s.personId === pid && s.kind === 'leave' && s.a <= i && i <= s.b) || null;
  const projects = [...new Set(w.map((s) => s.projectId))];
  return { work: w, leave: l, projects, proposed: w.some((s) => s.status === 'proposed'), state: l ? (w.length ? 'conflict' : 'leave') : projects.length > 1 ? 'conflict' : w.length ? 'work' : 'free' };
}

// Shared by the two planning components: data access and display helpers.
// Call ensureSlots() from the component's init().
export const planningBase = () => ({
  // used directly by the templates
  hdFmt,
  HD_LEAVE,

  get slots() { return this.planningSlots; },
  set slots(v) { this.planningSlots = v; },
  get opts() { return this.planningOpts; },
  // first visit: start from the demo planning
  ensureSlots() { if (!this.planningSlots) this.planningSlots = hdSeed(); },
  persist() { this.saveData('planningSlots'); },
  saveOpts() { this.saveData('planningOpts'); },

  hProject(id) { return this.allProjects.find((p) => p.id === id); },
  hColor(pid) { return HD_COLORS[Math.max(0, this.allProjects.findIndex((p) => p.id === pid)) % HD_COLORS.length]; },
  fmtHalf(i) { return hdFmt(hdDate(i)) + ' ' + (hdHalf(i) === 'AM' ? 'morning' : 'afternoon'); },
});
