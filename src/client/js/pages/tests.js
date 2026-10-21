// Page « Tests » (maquette : mocks/tests.html)
import { TODAY } from '../data/demo.js';

export default () => ({
  RESULTS: ['Passed', 'Failed', 'Pending'],
  statusFilter: 'All', projectFilter: 'All',
  menu: { open: false, x: 0, y: 0, testId: null },
  STAT_CARDS: [
    { key: 'Passed', icon: 'circle-check', tone: 'text-success', bar: 'bg-success' },
    { key: 'Failed', icon: 'circle-x', tone: 'text-destructive', bar: 'bg-destructive' },
    { key: 'Pending', icon: 'circle-dashed', tone: 'text-warning-foreground', bar: 'bg-warning' },
  ],
  init() {
    this.usePage({ close: () => { this.menu.open = false; }, searchCtx: () => ({ project: this.projectFilter !== 'All' ? this.projectFilter : null, kind: 'test' }) });
    const p = this.params.get('project');
    if (p && this.projects.some((x) => x.id === p)) this.projectFilter = p;
  },
  // écriture : membre du projet ou supérieur d'un membre (Admin : tout) ; le client ne modifie rien
  canEdit(pid) {
    if (this.role === 'Admin') return true;
    if (this.role === 'Client') return false;
    const p = this.getProject(pid);
    return !!p && this.access(p);
  },
  get anyEditable() { return this.projects.some((p) => this.canEdit(p.id)); },
  get scopedTests() { return this.tests.filter((t) => this.projectFilter === 'All' || t.projectId === this.projectFilter); },
  get visibleTests() { return this.scopedTests.filter((t) => this.statusFilter === 'All' || t.status === this.statusFilter); },
  count(s) { return this.scopedTests.filter((t) => t.status === s).length; },
  pctOf(s) { return Math.round((this.count(s) / (this.scopedTests.length || 1)) * 100); },
  toggleStatus(k) { this.statusFilter = this.statusFilter === k ? 'All' : k; },
  get campaigns() { return Array.from(new Set(this.scopedTests.map((t) => `${t.projectId}::${t.campaign}`))); },
  get groups() {
    return this.campaigns.map((key) => {
      const [pid, campaign] = key.split('::');
      const rows = this.visibleTests.filter((t) => t.projectId === pid && t.campaign === campaign);
      const all = this.scopedTests.filter((t) => t.projectId === pid && t.campaign === campaign);
      return { key, pid, campaign, rows, passed: all.filter((t) => t.status === 'Passed').length, total: all.length };
    }).filter((g) => g.rows.length > 0);
  },
  persist() { try { localStorage.setItem('maser-tests', JSON.stringify(this.allTests)); } catch (_) {} },
  setResult(id, status) {
    const t = this.allTests.find((x) => x.id === id);
    if (!t || !this.canEdit(t.projectId)) return;
    this.allTests = this.allTests.map((x) => (x.id === id ? { ...x, status, lastRun: TODAY } : x));
    this.persist();
  },
  openMenu(ev, test) {
    const r = ev.currentTarget.getBoundingClientRect(), w = 176;
    this.menu = { open: true, testId: test.id, x: Math.max(8, Math.min(r.left, window.innerWidth - w - 8)), y: r.bottom + 4 };
  },
  get menuTest() { return this.allTests.find((x) => x.id === this.menu.testId); },
});
