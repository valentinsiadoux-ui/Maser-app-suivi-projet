// Test campaigns and results (summary cards, campaign tables, "Set result" menu).
// Used by the Tests page (pages/tests) and the project's Tests tab (pages/project-detail/tabs/tests).
//
// The page or tab provides:
//   scopedTests   tests to show before the status filter
// and may override canEditTest(t).
import { TODAY } from '../core/demo-data.js';

export const testResults = () => ({
  RESULTS: ['Passed', 'Failed', 'Pending'],
  STAT_CARDS: [
    { key: 'Passed', icon: 'circle-check', tone: 'text-success', bar: 'bg-success' },
    { key: 'Failed', icon: 'circle-x', tone: 'text-destructive', bar: 'bg-destructive' },
    { key: 'Pending', icon: 'circle-dashed', tone: 'text-warning-foreground', bar: 'bg-warning' },
  ],
  statusFilter: 'All',
  menu: { open: false, x: 0, y: 0, testId: null },

  // ---------- summary and filters ----------
  get visibleTests() { return this.scopedTests.filter((t) => this.statusFilter === 'All' || t.status === this.statusFilter); },
  count(s) { return this.scopedTests.filter((t) => t.status === s).length; },
  pctOf(s) { return Math.round((this.count(s) / (this.scopedTests.length || 1)) * 100); },
  // clicking a summary card filters on it (click again: all)
  toggleStatus(k) { this.statusFilter = this.statusFilter === k ? 'All' : k; },

  // ---------- one table per project campaign ----------
  get campaigns() { return Array.from(new Set(this.scopedTests.map((t) => `${t.projectId}::${t.campaign}`))); },
  get groups() {
    return this.campaigns.map((key) => {
      const [pid, campaign] = key.split('::');
      const rows = this.visibleTests.filter((t) => t.projectId === pid && t.campaign === campaign);
      const all = this.scopedTests.filter((t) => t.projectId === pid && t.campaign === campaign);
      return { key, pid, campaign, rows, passed: all.filter((t) => t.status === 'Passed').length, total: all.length };
    }).filter((g) => g.rows.length > 0);
  },

  // ---------- "Set result" menu ----------
  canEditTest(t) { return this.canEdit(t.projectId); },
  setResult(id, status) {
    const t = this.allTests.find((x) => x.id === id);
    if (!t || !this.canEditTest(t)) return;
    this.allTests = this.allTests.map((x) => (x.id === id ? { ...x, status, lastRun: TODAY } : x));
    this.save('allTests');
  },
  openMenu(ev, test) {
    const r = ev.currentTarget.getBoundingClientRect(), w = 176;
    this.menu = { open: true, testId: test.id, x: Math.max(8, Math.min(r.left, window.innerWidth - w - 8)), y: r.bottom + 4 };
  },
  get menuTest() { return this.allTests.find((x) => x.id === this.menu.testId); },
  closeLocal() { this.menu.open = false; },
});
