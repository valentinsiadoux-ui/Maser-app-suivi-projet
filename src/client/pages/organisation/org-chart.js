// Organisation › visual org chart: one card per person under their supervisor, foldable branches,
// zoom (buttons, Ctrl+wheel, + / - / 0 keys), drag to pan, and a side panel for the selected person.
// Composed into organisation.js, whose rights and options it uses (staffAll, myBranch, canEditPerson, optionsFor).
// Markup: org-chart.html.
import { KEYS, readJSON, writeJSON } from '../../core/store.js';

export const orgChart = () => ({
  orgView: (() => { const v = readJSON(KEYS.orgView, 'chart'); return ['chart', 'list', 'both'].includes(v) ? v : 'chart'; })(), // chart | list | both
  collapsed: {},    // { memberId: true } folded branches
  selected: null,   // person shown in the side panel
  focusMine: false, // "Highlight my branch"
  CARD_W: 188, CARD_H: 160, GAP_X: 28, GAP_Y: 56, // card size and spacing (px)
  setOrgView(v) { this.orgView = v; writeJSON(KEYS.orgView, v); },
  childrenOf(id) { return this.staffAll.filter((m) => m.supervisorId === id); },
  // me, my branch and my supervisors (for "Highlight my branch")
  get mineSet() {
    const s = new Set([this.user.id, ...this.myBranch.map((m) => m.id)]), guard = new Set(); let c = this.user;
    while (c && c.supervisorId && !guard.has(c.id)) { guard.add(c.id); s.add(c.supervisorId); c = this.getMember(c.supervisorId); }
    return s;
  },
  // layout: width of each subtree in columns, then card positions and connector lines
  get chart() {
    const staff = this.staffAll, ids = new Set(staff.map((m) => m.id)), seen = new Set();
    const build = (m, depth) => {
      seen.add(m.id);
      const kids = this.childrenOf(m.id).filter((c) => !seen.has(c.id)), open = !this.collapsed[m.id];
      return { m, depth, hasKids: kids.length > 0, hidden: !open && kids.length > 0, below: this.subs(m.id).length, children: open ? kids.map((c) => build(c, depth + 1)) : [] };
    };
    // roots = people without a supervisor; walk the whole tree (even folded) to catch an isolated cycle
    const top = staff.filter((m) => !m.supervisorId || !ids.has(m.supervisorId)), reach = new Set();
    const mark = (m) => { reach.add(m.id); this.childrenOf(m.id).forEach((c) => { if (!reach.has(c.id)) mark(c); }); };
    top.forEach(mark); staff.filter((m) => !reach.has(m.id)).forEach((m) => { if (!reach.has(m.id)) { top.push(m); mark(m); } });
    const roots = top.map((m) => build(m, 0));
    const width = (n) => (n.w = n.children.length ? n.children.reduce((s, c) => s + width(c), 0) : 1);
    roots.forEach(width);
    const UX = this.CARD_W + this.GAP_X, UY = this.CARD_H + this.GAP_Y, nodes = [], d = [];
    let maxDepth = 0, left = 0;
    const place = (n, l) => {
      if (n.children.length) { let cur = l; n.children.forEach((c) => { place(c, cur); cur += c.w; }); n.cx = (n.children[0].cx + n.children[n.children.length - 1].cx) / 2; } else n.cx = l + n.w / 2;
      maxDepth = Math.max(maxDepth, n.depth);
      const eff = this.eff(n.m);
      nodes.push({ id: n.m.id, m: n.m, x: n.cx * UX - this.CARD_W / 2, y: n.depth * UY, eff, inherited: eff !== n.m.role, me: n.m.id === this.user.id, below: n.below, hasKids: n.hasKids, hidden: n.hidden, dim: this.focusMine && !this.mineSet.has(n.m.id) });
      if (n.children.length) {
        const px = n.cx * UX, yb = n.depth * UY + this.CARD_H, ym = yb + this.GAP_Y / 2, f = n.children[0].cx * UX, l2 = n.children[n.children.length - 1].cx * UX;
        let s = `M${px},${yb}V${ym}`; if (n.children.length > 1) s += `M${f},${ym}H${l2}`;
        n.children.forEach((c) => { s += `M${c.cx * UX},${ym}V${c.depth * UY}`; }); d.push(s);
      }
    };
    roots.forEach((r) => { place(r, left); left += r.w; });
    return { nodes, path: d.join(''), width: Math.max(left, 1) * UX - this.GAP_X, height: (maxDepth + 1) * UY - this.GAP_Y };
  },
  // ---------- zoom ----------
  zoom: (() => { const z = parseFloat(readJSON(KEYS.orgZoom, 1)); return z >= 0.3 && z <= 2 ? z : 1; })(),
  ZOOM_STEPS: [0.3, 0.4, 0.5, 0.6, 0.75, 0.9, 1, 1.15, 1.3, 1.5, 1.75, 2],
  panning: false, pan: { x: 0, y: 0, l: 0, t: 0 }, // dragging the background
  get zoomPct() { return Math.round(this.zoom * 100); },
  // zooming keeps the centre of the visible area in place
  setZoom(z) {
    const el = this.$refs.chartScroll, old = this.zoom, nz = Math.max(0.3, Math.min(2, Math.round(z * 100) / 100));
    if (nz === old) return;
    const cx = el ? (el.scrollLeft + el.clientWidth / 2) / old : 0, cy = el ? (el.scrollTop + el.clientHeight / 2) / old : 0;
    this.zoom = nz; writeJSON(KEYS.orgZoom, nz);
    if (el) this.$nextTick(() => { el.scrollLeft = cx * nz - el.clientWidth / 2; el.scrollTop = cy * nz - el.clientHeight / 2; });
  },
  zoomIn() { this.setZoom(this.ZOOM_STEPS.find((s) => s > this.zoom + 0.001) ?? 2); },
  zoomOut() { this.setZoom([...this.ZOOM_STEPS].reverse().find((s) => s < this.zoom - 0.001) ?? 0.3); },
  // fit the tree to the visible area (width and height)
  fit() {
    const el = this.$refs.chartScroll; if (!el) return;
    this.setZoom(Math.min((el.clientWidth - 48) / this.chart.width, ((window.innerHeight || 800) * 0.78 - 48) / this.chart.height, 1.25));
    this.$nextTick(() => { el.scrollLeft = 0; el.scrollTop = 0; });
  },
  wheelZoom(ev) { if (!(ev.ctrlKey || ev.metaKey)) return; ev.preventDefault(); this.setZoom(this.zoom * (ev.deltaY < 0 ? 1.1 : 1 / 1.1)); },
  zoomKey(ev) {
    if (ev.key === '+' || ev.key === '=') { ev.preventDefault(); this.zoomIn(); }
    else if (ev.key === '-') { ev.preventDefault(); this.zoomOut(); }
    else if (ev.key === '0') { ev.preventDefault(); this.setZoom(1); }
  },
  // drag the background to move around the tree
  panStart(ev) { if (ev.button !== 0 || ev.target.closest('button, a, input, select')) return; const el = this.$refs.chartScroll; this.panning = true; this.pan = { x: ev.clientX, y: ev.clientY, l: el.scrollLeft, t: el.scrollTop }; },
  panMove(ev) { if (!this.panning) return; const el = this.$refs.chartScroll; el.scrollLeft = this.pan.l - (ev.clientX - this.pan.x); el.scrollTop = this.pan.t - (ev.clientY - this.pan.y); },
  toggle(id) { this.collapsed = { ...this.collapsed, [id]: !this.collapsed[id] }; },
  expandAll() { this.collapsed = {}; },
  collapseAll() { const roots = new Set(this.staffAll.filter((m) => !m.supervisorId || !this.staffAll.some((s) => s.id === m.supervisorId)).map((m) => m.id)); this.collapsed = Object.fromEntries(this.staffAll.filter((m) => this.childrenOf(m.id).length && !roots.has(m.id)).map((m) => [m.id, true])); },
  select(id) { this.selected = this.selected === id ? null : id; },
  // side panel of the selected person
  get sel() {
    const m = this.selected && this.getMember(this.selected); if (!m) return null;
    return { m, eff: this.eff(m), inherited: this.eff(m) !== m.role, boss: m.supervisorId ? this.getMember(m.supervisorId) : null, direct: this.childrenOf(m.id), below: this.subs(m.id).length,
      projects: this.allProjects.filter((p) => p.memberIds.includes(m.id)), editable: this.canEditPerson(m.id), options: this.optionsFor(m), current: m.supervisorId ?? this.NONE, me: m.id === this.user.id };
  },
});
