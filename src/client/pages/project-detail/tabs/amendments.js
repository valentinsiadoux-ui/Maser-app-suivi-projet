// Project › Amendments tab: the amendments of this project only.
// Logic: features/amendment-register.js. Markup: tabs/amendments.html.
// Nested in the project page: `project` comes from project-detail.js.
import { compose } from '../../../core/compose.js';
import { amendmentRegister } from '../../../features/amendment-register.js';

export const amendmentsTab = () => compose(amendmentRegister(), {
  get list() { return this.allAmendments.filter((a) => a.projectId === this.project.id); },
  get defaultAmendmentProject() { return this.project.id; },
});
