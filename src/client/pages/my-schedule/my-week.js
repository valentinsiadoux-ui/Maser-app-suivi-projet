// My Schedule › week (the default view): my week as a half-day calendar. Click a half-day to put it on a
// project, on leave or free. Depending on the planning options, changes are planned or only proposed.
// Shared planning logic: features/half-day-planning.js. Markup: my-week.html.
import { compose } from '../../core/compose.js';
import { TODAY } from '../../core/demo-data.js';
import { planningBase, hdAdd, hdCell, hdDow, hdFmt, hdIdx, hdMonday, hdSeed, hdSetHalf, hdWeekend } from '../../features/half-day-planning.js';

export const myWeek = () => compose(planningBase(), {
  weekStart: hdMonday(TODAY), showWeekend: false, showOpts: false,
  pop: { open: false, i: 0, x: 0, y: 0 }, sheet: { open: false, i: 0 }, // choice popover (wide screens), bottom sheet (phone)
  init() { this.ensureSlots(); },
  get myProjects() { return this.allProjects.filter((p) => p.status === 'In Progress' && p.memberIds.includes(this.user.id)); },
  get canEditMe() { return this.opts.selfPlan !== 'no'; },
  get proposing() { return this.opts.selfPlan === 'validate'; },
  get days() {
    const out = [], n = this.showWeekend ? 7 : 5;
    for (let k = 0; k < 7 && out.length < n; k++) { const d = hdAdd(this.weekStart, k), wk = [0, 6].includes(hdDow(d)); if (wk && !this.showWeekend) continue; out.push({ date: d, AM: hdIdx(d, 'AM'), PM: hdIdx(d, 'PM'), today: d === TODAY, weekend: wk, label: hdFmt(d, 'ddd'), num: hdFmt(d, 'D') }); }
    return out;
  },
  get rangeLabel() { const d = this.days; return hdFmt(d[0].date, 'D MMM') + ' – ' + hdFmt(d[d.length - 1].date, 'D MMM YYYY'); },
  shift(n) { this.weekStart = hdAdd(this.weekStart, n * 7); this.pop.open = false; },
  goToday() { this.weekStart = hdMonday(TODAY); },
  cellAt(i) { return hdCell(this.slots, this.user.id, i); },
  // content of one half-day
  vw(d, half) {
    const i = half === 'AM' ? d.AM : d.PM, c = this.cellAt(i);
    return { i, state: c.state, weekend: d.weekend, proposed: c.proposed,
      blocks: c.work.map((s) => ({ code: this.hProject(s.projectId).code, name: this.hProject(s.projectId).name, color: this.hColor(s.projectId), task: s.taskId ? this.allTasks.find((t) => t.id === s.taskId)?.title : '' })) };
  },
  paint(i, val) {
    if (!this.canEditMe || hdWeekend(i)) return;
    this.slots = hdSetHalf(this.slots, this.user.id, i, val, undefined, this.proposing ? 'proposed' : 'planned');
    this.persist();
  },
  openPop(ev, d, half) {
    if (!this.canEditMe || d.weekend) return;
    const r = ev.currentTarget.getBoundingClientRect();
    this.pop = { open: true, i: half === 'AM' ? d.AM : d.PM, x: Math.max(8, Math.min(r.left, window.innerWidth - 276)), y: Math.min(r.bottom + 6, window.innerHeight - 330) };
  },
  choose(val) { this.paint(this.pop.i, val); this.pop.open = false; },
  openSheet(i) { if (this.canEditMe && !hdWeekend(i)) this.sheet = { open: true, i }; },
  chooseSheet(val) { this.paint(this.sheet.i, val); this.sheet.open = false; },
  get popCurrent() { return this.cellAt(this.pop.i); },
  get sheetCurrent() { return this.cellAt(this.sheet.i); },
  get idxs() { return this.days.flatMap((d) => [d.AM, d.PM]); },
  get summary() {
    const by = {}; let free = 0, leave = 0, cap = 0, used = 0;
    this.idxs.forEach((i) => {
      if (hdWeekend(i)) return; const c = this.cellAt(i);
      if (c.state === 'free') free++; else if (c.state === 'leave') leave++;
      if (!(c.leave && !c.work.length)) { cap++; if (c.work.length) used++; }
      c.projects.forEach((p) => { by[p] = (by[p] || 0) + 1; });
    });
    return { free, leave, cap, used, pct: cap ? Math.round((used / cap) * 100) : 0, list: Object.entries(by).map(([p, n]) => ({ ...this.hProject(p), color: this.hColor(p), n })).sort((a, b) => b.n - a.n) };
  },
  get proposedMine() { return this.slots.filter((s) => s.personId === this.user.id && s.status === 'proposed').length; },
  reset() { this.slots = hdSeed(); this.persist(); },
});
