// Project › Tasks tab: the task board of this project only.
// Board logic: features/task-board.js. Markup: tabs/tasks.html.
// Nested in the project page: `project`, `pTasks` and `editable` come from project-detail.js.
import { compose } from '../../../core/compose.js';
import { taskBoard } from '../../../features/task-board.js';

export const tasksTab = () => compose(taskBoard(), {
  init() { this.mine = this.role === 'Collaborator'; },

  get taskPool() { return this.pTasks; },
  get canAdd() { return this.editable; },
  get defaultTaskProject() { return this.project.id; },
  canEditTask(t) { return this.editable && t.projectId === this.project.id; },
});
