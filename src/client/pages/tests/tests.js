// Tests page: test campaigns and results across the projects I can see.
// Logic: features/test-results.js. Markup: tests.html (+ tests.overlays.html: "Set result" menu).
// Optional page (Settings › Appearance). ?project=p1 pre-filters on one project.
import { compose } from '../../core/compose.js';
import { testResults } from '../../features/test-results.js';

export default () => compose(testResults(), {
  projectFilter: 'All',

  init() {
    this.usePage({ close: () => this.closeLocal(), searchCtx: () => ({ project: this.projectFilter !== 'All' ? this.projectFilter : null, kind: 'test' }) });
    const p = this.params.get('project');
    if (p && this.projects.some((x) => x.id === p)) this.projectFilter = p;
  },

  get scopedTests() { return this.tests.filter((t) => this.projectFilter === 'All' || t.projectId === this.projectFilter); },
  // the "Set result" buttons appear if I can edit at least one project
  get anyEditable() { return this.projects.some((p) => this.canEdit(p.id)); },
});
