// Client Space: what a client sees of their projects (progress, milestones, amendments,
// meetings, contacts, messages). Staff see a preview of the first client account.
// Messages are notes of category "Client": features/note-feed.js. Markup: client-space.html.
// ?project=p1 pre-selects a project.
import { compose } from '../../core/compose.js';
import { TODAY } from '../../core/demo-data.js';
import { noteThreads } from '../../features/note-feed.js';
import { meetingLists } from '../../features/meeting-planner.js';

export default () => compose(noteThreads(), meetingLists(), {
  selected: '', // project shown

  init() {
    const p = this.params.get('project');
    this.selected = (p && this.clientProjects.some((x) => x.id === p)) ? p : (this.clientProjects[0]?.id ?? '');
    this.openThreadsWithComments(this.notes);
  },

  // the client sees their company; staff see a preview of the first client account
  get clientUser() { return this.role === 'Client' ? this.user : this.members.find((m) => m.role === 'Client'); },
  get clientProjects() {
    const c = this.clientUser;
    return this.projects.filter((p) => c && (p.memberIds.includes(c.id) || (!!c.company && p.client === c.company)));
  },
  get pageDescription() {
    const c = this.clientUser;
    return this.role === 'Client'
      ? `Welcome, ${c?.name}. Follow the progress of your projects with Maser Engineering.`
      : `Preview of what ${c?.name} (${c?.company}) sees. Internal tasks, tests and notes stay hidden.`;
  },

  // ---------- selected project ----------
  get cp() { return this.getProject(this.selected); },
  get cpProgress() { return this.cp ? this.progress(this.cp) : 0; },
  get cpMilestones() { return this.milestones.filter((m) => m.projectId === this.selected).sort((a, b) => a.date.localeCompare(b.date)).map((m) => ({ ...m, done: m.date < TODAY })); },
  // drafts stay internal
  get cpAmendments() { return this.allAmendments.filter((a) => a.projectId === this.selected && a.status !== 'Draft'); },
  get cpContacts() { return this.cp ? this.members.filter((m) => this.cp.memberIds.includes(m.id) && (m.role === 'Manager' || m.role === 'Admin')) : []; },
  // meetings (read-only): upcoming / past come from features/meeting-planner.js
  get list() { return this.meetings.filter((m) => m.projectId === this.selected).sort((a, b) => a.start.localeCompare(b.start)); },

  // ---------- messages = the project's "Client" notes ----------
  get cpNotes() { return this.notes.filter((n) => n.projectId === this.selected && n.category === 'Client'); },
  post() {
    if (!this.draft.trim() || !this.selected) return;
    this.addNote(this.selected, 'Client');
  },
});
