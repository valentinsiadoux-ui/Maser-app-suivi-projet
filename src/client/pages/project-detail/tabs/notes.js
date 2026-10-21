// Project › Notes tab: the notes of this project only.
// Logic: features/note-feed.js. Markup: tabs/notes.html.
// Nested in the project page: `project` and `editable` come from project-detail.js.
import { compose } from '../../../core/compose.js';
import { noteThreads, noteFilters } from '../../../features/note-feed.js';

export const notesTab = () => compose(noteThreads(), noteFilters(), {
  init() { this.openThreadsWithComments(this.pool); },

  get pool() { return this.notes.filter((n) => n.projectId === this.project.id); },
  canComment() { return this.role === 'Client' || this.editable; },
  post() {
    if (!this.draft.trim() || !this.editable) return;
    this.addNote(this.project.id, this.category);
  },
});
