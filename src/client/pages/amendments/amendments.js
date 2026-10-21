// Amendments page: contract amendments (avenants) across projects, with the approval workflow.
// Logic: features/amendment-register.js. Markup: amendments.html (+ amendments.overlays.html: dialog).
// Optional page (Settings › Appearance). ?project=p1 shows the amendments of one project only.
import { compose } from '../../core/compose.js';
import { amendmentRegister } from '../../features/amendment-register.js';

export default () => compose(amendmentRegister(), {
  fixedProject: null, // ?project=p1

  init() {
    this.usePage({ close: () => this.closeLocal() });
    const p = this.params.get('project');
    if (p && this.projects.some((x) => x.id === p)) this.fixedProject = p;
  },

  // a collaborator only sees the amendments of their projects
  get list() {
    return this.allAmendments.filter((a) => (!this.scoped || this.pids.has(a.projectId)) && (!this.fixedProject || a.projectId === this.fixedProject));
  },
  get defaultAmendmentProject() { return this.fixedProject ?? (this.projects[0]?.id ?? ''); },
});
