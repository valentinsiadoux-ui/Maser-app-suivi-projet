// Team Schedule › half-day grid (the default view): plan who works on which project, each morning and
// afternoon. Drag over half-days to plan work or leave; switch rows between employees and projects.
// Shared planning logic: features/half-day-planning.js. Markup: half-day-grid.html.
// Nested in the Team Schedule page: `staff` and `filter` come from team-schedule.js.
import { compose } from '../../core/compose.js';
import { TODAY } from '../../core/demo-data.js';
import { KEYS, readJSON, writeJSON } from '../../core/store.js';
import { planningBase, HD_LEAVE, hdAdd, hdAddHalf, hdCell, hdDate, hdDow, hdFmt, hdHalf, hdId, hdIdx, hdMerge, hdMonday, hdOverlap, hdSeed, hdSetHalf, hdWeekend } from '../../features/half-day-planning.js';

export const halfGrid = () => compose(planningBase(), {
  zoom: '1w',                 // 1w | 2w | 4w
  weekStart: hdMonday(TODAY), // first day shown
  hideWeekends: false,
  showConflicts: false, showOpts: false,
  sel: { rowId: null, a: null, b: null, active: false }, // half-days being selected with the mouse
  // "Plan work" dialog
  dlg: { open: false, mode: 'new', id: null, personId: '', kind: 'work', projectId: '', taskId: '', d1: '', h1: 'AM', d2: '', h2: 'PM', label: '' },
  who: '', sheet: { open: false, i: 0 }, // phone: person being planned, bottom sheet
  // one row per employee, or one row per project
  by: readJSON(KEYS.teamScheduleBy, 'person') === 'project' ? 'project' : 'person',
  pop: { open: false, pid: '', i: 0, x: 0, y: 0 }, pmsg: '', // "by project" popover and its message
  init() { this.ensureSlots(); this.who = (this.staff[0] || {}).id || ''; },
  setBy(v) { this.by = v; this.pop.open = false; this.pmsg = ''; writeJSON(KEYS.teamScheduleBy, v); },
  canEditPerson(pid) { return this.role === 'Admin' || this.staff.some((m) => m.id === pid); },
  pass(s) { return s.kind === 'leave' || this.filter === 'all' || (this.filter === 'active' ? this.hProject(s.projectId)?.status === 'In Progress' : s.projectId === this.filter); },
  memberProjects(pid) { return this.allProjects.filter((p) => p.status === 'In Progress' && p.memberIds.includes(pid)); },
  slotsOf(pid) { return this.slots.filter((s) => s.personId === pid); },

  // ---------- visible window ----------
  get nDays() { return { '1w': 7, '2w': 14, '4w': 28 }[this.zoom]; },
  get cellW() { return { '1w': 46, '2w': 30, '4w': 17 }[this.zoom]; },
  get cols() {
    const out = [];
    for (let k = 0; k < this.nDays; k++) {
      const date = hdAdd(this.weekStart, k), wk = [0, 6].includes(hdDow(date));
      if (wk && this.hideWeekends) continue;
      ['AM', 'PM'].forEach((h) => out.push({ i: hdIdx(date, h), date, half: h, weekend: wk, today: date === TODAY }));
    }
    return out;
  },
  get nCols() { return this.cols.length; },
  get days() { const m = new Map(); this.cols.forEach((c) => { if (!m.has(c.date)) m.set(c.date, { date: c.date, weekend: c.weekend, today: c.today, span: 0 }); m.get(c.date).span += 1; }); return [...m.values()]; },
  get rangeLabel() { const c = this.cols; return hdFmt(c[0].date, 'D MMM') + ' – ' + hdFmt(c[c.length - 1].date, 'D MMM YYYY'); },
  dayLabel(dy) { return this.zoom === '4w' ? hdFmt(dy.date, 'dd').charAt(0) + ' ' + hdFmt(dy.date, 'D') : hdFmt(dy.date, 'ddd D') + (hdFmt(dy.date, 'D') === '1' ? hdFmt(dy.date, ' MMM') : ''); },
  shift(dir) { this.weekStart = hdAdd(this.weekStart, dir * (this.zoom === '1w' ? 7 : this.nDays)); },
  goToday() { this.weekStart = hdMonday(TODAY); },
  goTo(i) { this.weekStart = hdMonday(hdDate(i)); },
  fmtShort(i) { return hdFmt(hdDate(i), 'ddd D') + ' ' + hdHalf(i); },

  // ---------- conflicts: two projects on the same half-day (when sharing is not allowed); work during leave ----------
  flagsOf(s) {
    const others = this.slotsOf(s.personId).filter((o) => o.id !== s.id), f = { conflict: false, leave: false, shared: false };
    if (s.kind === 'work') others.forEach((o) => { if (!hdOverlap(s, o)) return; if (o.kind === 'leave') f.leave = true; else if (this.opts.allowShare) f.shared = true; else f.conflict = true; });
    else others.forEach((o) => { if (o.kind === 'work' && hdOverlap(s, o)) f.leave = true; });
    return f;
  },
  get conflicts() {
    const out = [];
    this.staff.forEach((m) => {
      const w = this.slotsOf(m.id).filter((s) => s.kind === 'work');
      for (let x = 0; x < w.length; x++) for (let y = x + 1; y < w.length; y++) {
        const n = hdOverlap(w[x], w[y]); if (!n) continue;
        out.push({ key: w[x].id + w[y].id, person: m, a: Math.max(w[x].a, w[y].a), b: Math.min(w[x].b, w[y].b), n, codes: [this.hProject(w[x].projectId).code, this.hProject(w[y].projectId).code], leave: false });
      }
      this.slotsOf(m.id).filter((s) => s.kind === 'leave').forEach((l) => w.forEach((s) => {
        if (!hdOverlap(l, s)) return;
        out.push({ key: l.id + s.id, person: m, a: Math.max(l.a, s.a), b: Math.min(l.b, s.b), n: hdOverlap(l, s), codes: [this.hProject(s.projectId).code, 'leave'], leave: true });
      }));
    });
    return this.opts.allowShare ? out.filter((c) => c.leave) : out;
  },
  // estimate from tasks: free half-days between the start and the due date of an open task
  estimate(pid, first, last, plannedSet) {
    const byProject = {};
    this.allTasks.filter((t) => t.assigneeId === pid && t.status !== 'Done').forEach((t) => {
      const a = Math.max(hdIdx(t.startDate, 'AM'), first), b = Math.min(hdIdx(t.dueDate, 'PM'), last);
      if (a > b) return;
      if (!byProject[t.projectId]) byProject[t.projectId] = new Set();
      for (let i = a; i <= b; i++) byProject[t.projectId].add(i);
    });
    const out = [], between = (p, i) => { for (let k = p + 1; k < i; k++) if (!hdWeekend(k)) return false; return true; };
    Object.entries(byProject).forEach(([projectId, set]) => {
      if (!this.pass({ kind: 'work', projectId })) return;
      const free = [...set].filter((i) => !plannedSet.has(i) && !hdWeekend(i)).sort((x, y) => x - y);
      let run = null;
      free.forEach((i) => { if (run && between(run.b, i)) run.b = i; else { if (run) out.push(run); run = { projectId, a: i, b: i }; } });
      if (run) out.push(run);
    });
    return out.map((e) => ({ id: 'est' + pid + e.projectId + e.a, personId: pid, kind: 'est', ...e, status: 'estimated' }));
  },

  // ---------- the grid (computed in one pass) ----------
  get grid() {
    const cols = this.cols, n = cols.length, first = cols[0].i, last = cols[n - 1].i, LANE = 26;
    const pos0 = (i) => cols.findIndex((c) => c.i >= i), pos1 = (i) => { for (let k = n - 1; k >= 0; k--) if (cols[k].i <= i) return k; return -1; };
    const rows = this.staff.map((m) => {
      const planned = new Set();
      this.slotsOf(m.id).filter((s) => s.kind === 'work').forEach((s) => { for (let i = s.a; i <= s.b; i++) planned.add(i); });
      const items = [...this.slotsOf(m.id).filter((s) => this.pass(s)), ...(this.opts.source === 'both' ? this.estimate(m.id, first, last, planned) : [])];
      const placed = items.map((s) => { const a = pos0(s.a), b = pos1(s.b); if (a < 0 || b < 0 || a > b || s.b < first || s.a > last) return null; return { s, a, b, flags: s.kind === 'est' ? {} : this.flagsOf(s) }; }).filter(Boolean).sort((x, y) => x.a - y.a || x.b - y.b);
      const ends = []; placed.forEach((p) => { let l = ends.findIndex((e) => e < p.a); if (l === -1) l = ends.length; ends[l] = p.b; p.lane = l; });
      const lanes = Math.max(1, ends.length);
      const bars = placed.map((p) => {
        const s = p.s, proj = s.projectId ? this.hProject(s.projectId) : null, nHalf = s.b - s.a + 1, color = s.projectId ? this.hColor(s.projectId) : '';
        const bg = s.kind === 'leave' ? HD_LEAVE : s.kind === 'est' ? `repeating-linear-gradient(135deg, ${color} 0 4px, color-mix(in oklch, ${color} 35%, transparent) 4px 8px)` : color;
        const task = s.taskId ? this.allTasks.find((t) => t.id === s.taskId) : null;
        const title = s.kind === 'leave' ? `${s.label || 'Leave'} · ${this.fmtHalf(s.a)} → ${this.fmtHalf(s.b)}`
          : `${proj.name}${task ? ' · ' + task.title : ''} · ${this.fmtHalf(s.a)} → ${this.fmtHalf(s.b)} · ${nHalf} half-day${nHalf > 1 ? 's' : ''}${s.kind === 'est' ? ' (estimated from tasks)' : ''}${s.status === 'proposed' ? ' (proposed)' : ''}`;
        return { key: s.id, slot: s, kind: s.kind, status: s.status, left: (p.a / n) * 100, width: ((p.b - p.a + 1) / n) * 100, top: 7 + p.lane * LANE, bg, flags: p.flags, label: s.kind === 'leave' ? (s.label || 'Leave') : proj.code, nHalf, title, wide: p.b - p.a + 1 >= 3 };
      });
      let cap = 0, usedN = 0;
      cols.forEach((c) => { if (c.weekend) return; const onLeave = this.slotsOf(m.id).some((s) => s.kind === 'leave' && c.i >= s.a && c.i <= s.b); if (!onLeave) { cap += 1; if (planned.has(c.i)) usedN += 1; } });
      return { person: m, bars, lanes, height: Math.max(48, lanes * LANE + 14), cap, planned: usedN, free: cap - usedN, pct: cap ? Math.round((usedN / cap) * 100) : 0, editable: this.canEditPerson(m.id) };
    });
    const coverage = cols.map((c) => rows.filter((r) => this.slotsOf(r.person.id).some((s) => s.kind === 'work' && this.pass(s) && c.i >= s.a && c.i <= s.b)).length);
    const proj = {};
    rows.forEach((r) => this.slotsOf(r.person.id).filter((s) => s.kind === 'work' && this.pass(s)).forEach((s) => {
      const a = Math.max(s.a, first), b = Math.min(s.b, last); if (a > b) return;
      let k = 0; cols.forEach((c) => { if (c.i >= a && c.i <= b) k++; });
      if (!k) return;
      (proj[s.projectId] ||= { id: s.projectId, half: 0, people: new Set() }).half += k; proj[s.projectId].people.add(s.personId);
    }));
    const projects = Object.values(proj).map((p) => ({ ...this.hProject(p.id), half: p.half, people: p.people.size, color: this.hColor(p.id) })).sort((x, y) => y.half - x.half);
    return { rows, cols, coverage, maxCov: Math.max(1, ...coverage), projects, minWidth: 224 + n * this.cellW };
  },

  // ---------- mouse selection and the "Plan work" dialog ----------
  startSel(row, pos) { if (!row.editable) return; this.sel = { rowId: row.person.id, a: pos, b: pos, active: true }; },
  moveSel(row, pos) { if (this.sel.active && this.sel.rowId === row.person.id) this.sel.b = pos; },
  inSel(row, pos) { return this.sel.rowId === row.person.id && pos >= Math.min(this.sel.a, this.sel.b) && pos <= Math.max(this.sel.a, this.sel.b); },
  endSel() {
    if (!this.sel.active) return;
    const c = this.cols, a = c[Math.min(this.sel.a, this.sel.b)].i, b = c[Math.max(this.sel.a, this.sel.b)].i, who = this.sel.rowId;
    this.sel = { rowId: null, a: null, b: null, active: false };
    this.openNew(who, a, b);
  },
  get dlgTasks() { return this.allTasks.filter((t) => t.assigneeId === this.dlg.personId && t.projectId === this.dlg.projectId && t.status !== 'Done'); },
  get dlgA() { return hdIdx(this.dlg.d1, this.dlg.h1); },
  get dlgB() { return hdIdx(this.dlg.d2, this.dlg.h2); },
  get dlgValid() { return this.dlg.d1 && this.dlg.d2 && this.dlgB >= this.dlgA && (this.dlg.kind === 'leave' || this.dlg.projectId); },
  get dlgCount() { return this.dlgValid ? this.dlgB - this.dlgA + 1 : 0; },
  get dlgWarnings() {
    if (!this.dlgValid) return [];
    const me = { id: this.dlg.id, personId: this.dlg.personId, a: this.dlgA, b: this.dlgB }, w = [], others = this.slotsOf(me.personId).filter((o) => o.id !== me.id);
    let weekend = 0; for (let i = me.a; i <= me.b; i++) if (hdWeekend(i)) weekend++;
    if (this.dlg.kind === 'work') {
      const ovWork = others.filter((o) => o.kind === 'work').reduce((s, o) => s + hdOverlap(me, o), 0), ovLeave = others.filter((o) => o.kind === 'leave').reduce((s, o) => s + hdOverlap(me, o), 0);
      if (ovWork) w.push({ tone: this.opts.allowShare ? 'info' : 'error', text: this.opts.allowShare ? `${ovWork} half-day${ovWork > 1 ? 's are' : ' is'} shared with another project.` : `Conflict: ${ovWork} half-day${ovWork > 1 ? 's are' : ' is'} already planned on another project.` });
      if (ovLeave) w.push({ tone: 'error', text: `${ovLeave} half-day${ovLeave > 1 ? 's fall' : ' falls'} during leave.` });
    } else {
      const ov = others.filter((o) => o.kind === 'work').reduce((s, o) => s + hdOverlap(me, o), 0);
      if (ov) w.push({ tone: 'error', text: `This leave overlaps ${ov} planned half-day${ov > 1 ? 's' : ''}.` });
    }
    if (weekend) w.push({ tone: 'warn', text: `${weekend} half-day${weekend > 1 ? 's fall' : ' falls'} on a non-working day.` });
    return w;
  },
  openNew(personId, a, b) {
    const mp = this.memberProjects(personId);
    this.dlg = { open: true, mode: 'new', id: null, personId, kind: 'work', projectId: mp[0]?.id ?? '', taskId: '', d1: hdDate(a), h1: hdHalf(a), d2: hdDate(b), h2: hdHalf(b), label: '' };
  },
  openEdit(slot) {
    if (!this.canEditPerson(slot.personId)) return;
    this.dlg = { open: true, mode: 'edit', id: slot.id, personId: slot.personId, kind: slot.kind, projectId: slot.projectId ?? '', taskId: slot.taskId ?? '', d1: hdDate(slot.a), h1: hdHalf(slot.a), d2: hdDate(slot.b), h2: hdHalf(slot.b), label: slot.label || '' };
  },
  get dlgStatus() { return this.dlg.mode === 'edit' ? this.slots.find((s) => s.id === this.dlg.id)?.status : null; },
  save() {
    if (!this.dlgValid) return;
    const d = this.dlg, base = { personId: d.personId, kind: d.kind, projectId: d.kind === 'work' ? d.projectId : null, taskId: d.kind === 'work' ? (d.taskId || null) : null, label: d.kind === 'leave' ? (d.label || 'Annual leave') : undefined, a: this.dlgA, b: this.dlgB };
    if (d.mode === 'edit') this.slots = this.slots.map((s) => (s.id === d.id ? { ...s, ...base, status: 'planned' } : s));
    else this.slots = [...this.slots, { id: hdId(), ...base, status: 'planned' }];
    this.slots = hdMerge(this.slots); this.persist(); this.dlg.open = false;
  },
  approve() { this.slots = hdMerge(this.slots.map((s) => (s.id === this.dlg.id ? { ...s, status: 'planned' } : s))); this.persist(); this.dlg.open = false; },
  remove() { this.slots = this.slots.filter((s) => s.id !== this.dlg.id); this.persist(); this.dlg.open = false; },
  get proposedCount() { return this.slots.filter((s) => s.status === 'proposed' && this.staff.some((m) => m.id === s.personId)).length; },
  reset() { this.slots = hdSeed(); this.persist(); this.weekStart = hdMonday(TODAY); },

  // ---------- by project: one row per project, the people working on it in each half-day ----------
  get pRows() {
    const cols = this.cols, inWindow = (p) => this.staff.some((m) => this.slotsOf(m.id).some((s) => s.kind === 'work' && s.projectId === p.id && s.b >= cols[0].i && s.a <= cols[cols.length - 1].i));
    const list = this.filter === 'all' ? this.allProjects.filter((p) => p.status === 'In Progress' || inWindow(p)) : this.filter === 'active' ? this.allProjects.filter((p) => p.status === 'In Progress') : this.allProjects.filter((p) => p.id === this.filter);
    return list.map((p) => {
      const cells = cols.map((c) => { const people = c.weekend ? [] : this.staff.filter((m) => hdCell(this.slots, m.id, c.i).projects.includes(p.id)); return { i: c.i, col: c, people, n: people.length }; });
      return { project: p, color: this.hColor(p.id), cells, total: cells.reduce((s, c) => s + c.n, 0), gaps: cells.filter((c) => !c.col.weekend && c.n === 0).length };
    });
  },
  get pTotals() {
    return this.cols.map((c) => {
      if (c.weekend) return { i: c.i, used: 0, avail: 0, weekend: true };
      let used = 0, avail = 0;
      this.staff.forEach((m) => { const x = hdCell(this.slots, m.id, c.i); if (!(x.leave && !x.work.length)) avail++; if (x.work.length) used++; });
      return { i: c.i, used, avail, weekend: false };
    });
  },
  openPop(ev, pid, i) {
    const r = ev.currentTarget.getBoundingClientRect();
    this.pmsg = '';
    this.pop = { open: true, pid, i, x: Math.max(8, Math.min(r.left, window.innerWidth - 316)), y: Math.min(r.bottom + 6, window.innerHeight - 360) };
  },
  get popTitle() { return (this.hProject(this.pop.pid)?.code || '') + ' · ' + this.fmtHalf(this.pop.i); },
  get popRows() {
    const p = this.hProject(this.pop.pid);
    return this.staff.map((m) => {
      const c = hdCell(this.slots, m.id, this.pop.i), on = c.projects.includes(this.pop.pid), member = !!p && p.memberIds.includes(m.id);
      return { m, on, member, leave: c.state === 'leave', others: c.projects.filter((x) => x !== this.pop.pid).map((x) => this.hProject(x).code), editable: this.canEditPerson(m.id) && member };
    });
  },
  // add or remove someone on the project for this half-day (other projects are never changed)
  togglePerson(r) {
    this.pmsg = ''; if (!r.editable) return;
    if (r.on) this.slots = hdSetHalf(this.slots, r.m.id, this.pop.i, null, (s) => s.kind === 'work' && s.projectId === this.pop.pid);
    else if (r.leave) { this.pmsg = r.m.name.split(' ')[0] + ' is on leave that half-day.'; return; }
    else if (r.others.length && !this.opts.allowShare) { this.pmsg = r.m.name.split(' ')[0] + ' is already on ' + r.others.join(', ') + ' (allow sharing in the options to double-book).'; return; }
    else this.slots = hdAddHalf(this.slots, r.m.id, this.pop.i, this.pop.pid);
    this.persist();
  },

  // ---------- phone agenda: who does what in each half-day ----------
  get eDays() { const out = []; for (let k = 0; k < 7 && out.length < 5; k++) { const d = hdAdd(this.weekStart, k); if ([0, 6].includes(hdDow(d))) continue; out.push({ date: d, AM: hdIdx(d, 'AM'), PM: hdIdx(d, 'PM'), today: d === TODAY }); } return out; },
  eGroups(i) {
    const by = {}, leave = [], free = [];
    this.staff.forEach((m) => { const c = hdCell(this.slots, m.id, i); if (c.state === 'leave') leave.push(m); else if (c.state === 'free') free.push(m); c.projects.forEach((p) => { if (this.pass({ kind: 'work', projectId: p })) (by[p] ||= []).push(m); }); });
    return { list: Object.entries(by).map(([p, people]) => ({ ...this.hProject(p), color: this.hColor(p), people })), leave, free };
  },
  eOpen(i) { if (this.staff.some((m) => this.canEditPerson(m.id))) this.sheet = { open: true, i }; },
  get sheetPerson() { return this.getMember(this.who); },
  eChoose(val) { if (!this.canEditPerson(this.who)) return; this.slots = hdSetHalf(this.slots, this.who, this.sheet.i, val); this.persist(); this.sheet.open = false; },
  get sheetCurrent() { return hdCell(this.slots, this.who, this.sheet.i); },
  get sheetProjects() { return this.memberProjects(this.who); },
});
