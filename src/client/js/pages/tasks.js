// Page « Tâches » (maquette : mocks/tasks.html)

export default () => ({
  STATUSES: ['To Do', 'In Progress', 'Review', 'Done'],
  COL_ACCENT: { 'To Do': 'bg-muted-foreground/40', 'In Progress': 'bg-primary', Review: 'bg-warning', Done: 'bg-success' },
  view: (() => { try { return JSON.parse(localStorage.getItem('maser-prefs-v1') || '{}').taskView || 'board'; } catch (_) { return 'board'; } })(),
  priorityFilter: 'All', projectFilter: 'All', mine: false,
  dragOver: null,
  menu: { open: false, x: 0, y: 0, taskId: null, edit: false },
  dialog: { open: false, mode: 'add', taskId: null },
  tform: { title: '', projectId: '', status: 'To Do', priority: 'Medium', assigneeId: '', startDate: '2026-10-19', dueDate: '2026-11-06' },

  init() {
    this.usePage({ close: () => { this.menu.open = false; this.dialog.open = false; }, searchCtx: () => ({ project: this.projectFilter !== 'All' ? this.projectFilter : null, kind: 'task' }) });
    this.mine = this.role === 'Collaborator';
    const p = this.params.get('project');
    if (p && this.projects.some((x) => x.id === p)) this.projectFilter = p;
  },

  // droits d'écriture : membre du projet ou supérieur d'un membre (Admin : tout) ; le client ne modifie rien
  canEdit(pid) {
    if (this.role === 'Admin') return true;
    if (this.role === 'Client') return false;
    const p = this.getProject(pid);
    return !!p && this.access(p);
  },
  get editableProjects() { return this.projects.filter((p) => this.canEdit(p.id)); },
  get addableProjects() { return this.editableProjects.filter((p) => p.status === 'In Progress'); },
  get canAdd() { return this.addableProjects.length > 0; },

  get visible() {
    return this.tasks.filter((t) =>
      (this.projectFilter === 'All' || t.projectId === this.projectFilter) &&
      (this.priorityFilter === 'All' || t.priority === this.priorityFilter) &&
      (!this.mine || t.assigneeId === this.user.id));
  },
  by(status) { return this.visible.filter((t) => t.status === status); },
  isLate(t) { return t.status !== 'Done' && this.daysUntil(t.dueDate) < 0; },

  persist() { try { localStorage.setItem('maser-tasks', JSON.stringify(this.allTasks)); } catch (_) {} },
  setStatus(id, status) {
    const t = this.allTasks.find((x) => x.id === id);
    if (!t || !this.canEdit(t.projectId)) return;
    this.allTasks = this.allTasks.map((x) => (x.id === id ? { ...x, status } : x));
    this.persist();
  },
  drop(e, status) {
    const id = e.dataTransfer.getData('text/task');
    const t = this.visible.find((x) => x.id === id);
    if (t && this.canEdit(t.projectId)) this.setStatus(id, status);
    this.dragOver = null;
  },

  // menu flottant partagé (cartes du Board et statuts de la List)
  openMenu(ev, task, withEdit, align) {
    const r = ev.currentTarget.getBoundingClientRect(), w = 176;
    const x = align === 'end' ? r.right - w : r.left;
    this.menu = { open: true, taskId: task.id, edit: withEdit, x: Math.max(8, Math.min(x, window.innerWidth - w - 8)), y: r.bottom + 4 };
  },
  get menuTask() { return this.allTasks.find((x) => x.id === this.menu.taskId); },

  // dialogue « Add task » / « Edit task »
  get formProject() { return this.getProject(this.tform.projectId); },
  get formTeam() {
    const p = this.formProject;
    return this.members.filter((m) => m.role !== 'Client' && ((p && p.memberIds.includes(m.id)) || m.id === this.tform.assigneeId));
  },
  get validTask() { const f = this.tform; return f.title.trim() && f.projectId && f.assigneeId && f.dueDate >= f.startDate; },
  onProjectChange() {
    const p = this.formProject;
    if (p && !p.memberIds.includes(this.tform.assigneeId)) this.tform.assigneeId = p.memberIds.find((id) => this.getMember(id)?.role !== 'Client') || '';
  },
  openAdd(status) {
    this.menu.open = false;
    const proj = this.projectFilter !== 'All' && this.addableProjects.some((p) => p.id === this.projectFilter) ? this.projectFilter : (this.addableProjects[0]?.id ?? '');
    this.tform = { title: '', projectId: proj, status, priority: 'Medium', assigneeId: '', startDate: '2026-10-19', dueDate: '2026-11-06' };
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
    if (!this.validTask) return;
    const f = this.tform;
    if (!this.canEdit(f.projectId)) return;
    if (this.dialog.mode === 'add') {
      this.allTasks = [...this.allTasks, { id: 't' + Date.now(), projectId: f.projectId, title: f.title.trim(), status: f.status, priority: f.priority, assigneeId: f.assigneeId, startDate: f.startDate, dueDate: f.dueDate }];
    } else {
      this.allTasks = this.allTasks.map((x) => (x.id === this.dialog.taskId ? { ...x, title: f.title.trim(), status: f.status, priority: f.priority, assigneeId: f.assigneeId, startDate: f.startDate, dueDate: f.dueDate } : x));
    }
    this.persist();
    this.dialog.open = false;
  },
});
