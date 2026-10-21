// Tasks page: every task of the projects I can see, as a Board or a List.
// Board logic: features/task-board.js. Markup: tasks.html (+ tasks.overlays.html: menu and dialog).
// Optional page (Settings › Appearance). ?project=p1 pre-filters on one project.
import { compose } from '../../core/compose.js';
import { taskBoard } from '../../features/task-board.js';

export default () => compose(taskBoard(), {
  projectFilter: 'All',

  init() {
    this.usePage({ close: () => this.closeLocal(), searchCtx: () => ({ project: this.projectFilter !== 'All' ? this.projectFilter : null, kind: 'task' }) });
    this.mine = this.role === 'Collaborator';
    const p = this.params.get('project');
    if (p && this.projects.some((x) => x.id === p)) this.projectFilter = p;
  },

  get taskPool() { return this.tasks.filter((t) => this.projectFilter === 'All' || t.projectId === this.projectFilter); },

  // new tasks go into an active project I can edit
  get addableProjects() { return this.projects.filter((p) => this.canEdit(p.id) && p.status === 'In Progress'); },
  get canAdd() { return this.addableProjects.length > 0; },
  get defaultTaskProject() {
    return this.projectFilter !== 'All' && this.addableProjects.some((p) => p.id === this.projectFilter) ? this.projectFilter : (this.addableProjects[0]?.id ?? '');
  },
});
