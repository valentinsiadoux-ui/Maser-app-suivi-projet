// Project › Tests tab: test campaigns of this project only.
// Logic: features/test-results.js. Markup: tabs/tests.html.
// Nested in the project page: `project`, `pTests` and `editable` come from project-detail.js.
import { compose } from '../../../core/compose.js';
import { testResults } from '../../../features/test-results.js';

export const testsTab = () => compose(testResults(), {
  get scopedTests() { return this.pTests; },
  canEditTest(t) { return this.editable && t.projectId === this.project.id; },
});
