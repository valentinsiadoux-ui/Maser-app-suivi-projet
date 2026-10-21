// Task board (Board / List views, "Move to" menu, Add / Edit dialog).
// Used by the Tasks page (pages/tasks) and the project's Tasks tab (pages/project-detail/tabs/tasks).
//
// The page or tab provides:
//   taskPool            tasks to show before the priority / "mine" filters
//   canAdd              whether the "Add task" buttons are shown
//   defaultTaskProject  project pre-selected in the Add dialog
// and may override canEditTask(t).
import { readPrefs } from '../core/preferences.js';

export const STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];

export const taskBoard = () => ({
  STATUSES,
  COL_ACCENT: { 'To Do': 'bg-muted-foreground/40', 'In Progress': 'bg-primary', Review: 'bg-warning', Done: 'bg-success' },
  view: readPrefs().taskView,
  priorityFilter: 'All', mine: false,
  dragOver: null,
  menu: { open: false, x: 0, y: 0, taskId: null, edit: false },
  dialog: { open: false, mode: 'add', taskId: null },
  tform: { title: '', projectId: '', status: 'To Do', priority: 'Medium', assigneeId: '', startDate: '2026-10-19', dueDate: '2026-11-06' },

  // ---------- reading ----------
  get visible() {
    return this.taskPool.filter((t) => (this.priorityFilter === 'All' || t.priority === this.priorityFilter) && (!this.mine || t.assigneeId === this.user.id));
  },
  by(status) { return this.visible.filter((t) => t.status === status); },
  isLate(t) { return t.status !== 'Done' && this.daysUntil(t.dueDate) < 0; },

  // ---------- changing a status (menu or drag & drop) ----------
  canEditTask(t) { return this.canEdit(t.projectId); },
  setStatus(id, status) {
    const t = this.allTasks.find((x) => x.id === id);
    if (!t || !this.canEditTask(t)) return;
    this.allTasks = this.allTasks.map((x) => (x.id === id ? { ...x, status } : x));
    this.save('allTasks');
  },
  drop(e, status) {
    const id = e.dataTransfer.getData('text/task');
    if (this.visible.some((x) => x.id === id)) this.setStatus(id, status);
    this.dragOver = null;
  },

  // floating menu shared by Board cards and List statuses
  openMenu(ev, task, withEdit, align) {
    const r = ev.currentTarget.getBoundingClientRect(), w = 176;
    const x = align === 'end' ? r.right - w : r.left;
    this.menu = { open: true, taskId: task.id, edit: withEdit, x: Math.max(8, Math.min(x, window.innerWidth - w - 8)), y: r.bottom + 4 };
  },
  get menuTask() { return this.allTasks.find((x) => x.id === this.menu.taskId); },
  closeLocal() { this.dialog.open = false; this.menu.open = false; },

  // ---------- "Add task" / "Edit task" dialog ----------
  get formProject() { return this.getProject(this.tform.projectId); },
  // assignee choices: the project's staff (+ the current assignee)
  get formTeam() {
    const p = this.formProject;
    return this.members.filter((m) => m.role !== 'Client' && ((p && p.memberIds.includes(m.id)) || m.id === this.tform.assigneeId));
  },
  get validTask() { const f = this.tform; return f.title.trim() && f.projectId && f.assigneeId && f.dueDate >= f.startDate; },
  // keep the assignee valid when the project changes
  onProjectChange() {
    const p = this.formProject;
    if (p && !p.memberIds.includes(this.tform.assigneeId)) this.tform.assigneeId = p.memberIds.find((id) => this.getMember(id)?.role !== 'Client') || '';
  },
  openAdd(status) {
    this.menu.open = false;
    this.tform = { title: '', projectId: this.defaultTaskProject, status, priority: 'Medium', assigneeId: '', startDate: '2026-10-19', dueDate: '2026-11-06' };
    this.onProjectChange();
    this.dialog = { open: true, mode: 'add', taskId: null };
    this.$nextTick(() => this.$refs.ttitle && this.$refs.ttitle.focus());
  },
  openEdit(task) {
    this.menu.open = false;
    this.tform = { title: task.title, projectId: task.projectId, status: task.status, priority: task.priority, assigneeId: task.assigneeId, startDate: task.startDate, dueDate: task.dueDate };
    this.dialog = { open: true, mode: 'edit', taskId: task.id };
    this.$nextTick(() => this.$refs.ttitle && this.$refs.ttitle.focus());
  },
  submitTask() {
    const f = this.tform;
    if (!this.validTask || !this.canEdit(f.projectId)) return;
    if (this.dialog.mode === 'add') {
      this.allTasks = [...this.allTasks, { id: 't' + Date.now(), projectId: f.projectId, title: f.title.trim(), status: f.status, priority: f.priority, assigneeId: f.assigneeId, startDate: f.startDate, dueDate: f.dueDate }];
    } else {
      this.allTasks = this.allTasks.map((x) => (x.id === this.dialog.taskId ? { ...x, title: f.title.trim(), status: f.status, priority: f.priority, assigneeId: f.assigneeId, startDate: f.startDate, dueDate: f.dueDate } : x));
    }
    this.save('allTasks');
    this.dialog.open = false;
  },
});
