// Notes page: technical notes, site visits, decisions and client messages across projects.
// Logic: features/note-feed.js. Markup: notes.html.
// Optional page (Settings › Appearance). ?project=p1 shows the notes of one project only.
import { compose } from '../../core/compose.js';
import { noteThreads, noteFilters } from '../../features/note-feed.js';

export default () => compose(noteThreads(), noteFilters(), {
  fixedProject: null, // ?project=p1
  projectSel: '',     // project of the next note (when not fixed)

  init() {
    this.usePage({ searchCtx: () => ({ project: this.fixedProject, kind: 'note' }) });
    const p = this.params.get('project');
    if (p && this.getProject(p) && this.canViewProject(p)) this.fixedProject = p;
    this.projectSel = this.fixedProject ?? (this.notableProjects[0]?.id ?? '');
    this.openThreadsWithComments(this.notes);
  },
  canViewProject(pid) {
    const p = this.getProject(pid); if (!p) return false;
    if (this.role === 'Admin' || this.role === 'Manager') return true;
    return this.access(p);
  },
  // projects where I can add a note: manager = their projects; collaborator = theirs; admin = all
  get notableProjects() {
    if (this.role === 'Manager') return this.allProjects.filter((p) => p.memberIds.includes(this.user.id));
    if (this.role === 'Collaborator') return this.projects;
    return this.allProjects;
  },
  get canWrite() { return this.fixedProject ? this.canEdit(this.fixedProject) : this.notableProjects.length > 0; },
  get pool() { return this.notes.filter((n) => !this.fixedProject || n.projectId === this.fixedProject); },

  post() {
    if (!this.draft.trim()) return;
    const pid = this.fixedProject ?? this.projectSel;
    if (!this.canEdit(pid) && this.role !== 'Client') return;
    this.addNote(pid, this.category);
  },
});
