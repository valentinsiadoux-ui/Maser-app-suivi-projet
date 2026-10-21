// Notes and their comment threads.
// Used by the Notes page (pages/notes), the project's Notes tab (pages/project-detail/tabs/notes)
// and the client messages of the Client Space (pages/client-space).

// Writing, editing, deleting and commenting notes.
// The page provides post() (who may post where), using addNote(); it may override canComment(n).
export const noteThreads = () => ({
  draft: '',                          // new note being written
  editing: { id: null, content: '' }, // note being edited
  openComments: {},                   // { noteId: true } threads that are expanded
  drafts: {},                         // { noteId: text } comments being written

  canEditNote(n) { return n.authorId === this.user.id || this.role === 'Admin'; },
  canComment(n) { return this.role === 'Client' || this.canEdit(n.projectId); },

  // add the current draft as a new note at the top of the feed
  addNote(projectId, category) {
    this.allNotes = [{ id: 'n' + Date.now(), projectId, authorId: this.user.id, category, content: this.draft.trim(), createdAt: this.nowIso(), comments: [] }, ...this.allNotes];
    this.draft = ''; this.save('allNotes');
  },
  startEdit(n) { this.editing = { id: n.id, content: n.content }; },
  saveEdit() {
    const c = this.editing.content.trim(); if (!c) return;
    this.allNotes = this.allNotes.map((x) => (x.id === this.editing.id ? { ...x, content: c } : x));
    this.editing = { id: null, content: '' }; this.save('allNotes');
  },
  remove(n) { this.allNotes = this.allNotes.filter((x) => x.id !== n.id); this.save('allNotes'); },

  // ---------- comments ----------
  // expand the threads that already have comments (call from init())
  openThreadsWithComments(notes) { notes.forEach((n) => { if ((n.comments || []).length) this.openComments[n.id] = true; }); },
  toggleComments(n) { this.openComments = { ...this.openComments, [n.id]: !this.openComments[n.id] }; },
  postComment(n) {
    const text = (this.drafts[n.id] || '').trim(); if (!text || !this.canComment(n)) return;
    this.allNotes = this.allNotes.map((x) => (x.id === n.id ? { ...x, comments: [...(x.comments || []), { id: 'c' + Date.now(), authorId: this.user.id, content: text, createdAt: this.nowIso() }] } : x));
    this.drafts = { ...this.drafts, [n.id]: '' }; this.save('allNotes');
  },
});

// Category filter chips and the category of new notes.
// The page provides `pool`: the notes to show before the category filter.
export const noteFilters = () => ({
  CATEGORIES: ['Technical', 'Site Visit', 'Decision', 'Client'],
  filter: 'All',          // category shown
  category: 'Technical',  // category of the next note
  get visibleNotes() { return this.pool.filter((n) => this.filter === 'All' || n.category === this.filter); },
  countOf(c) { return this.pool.filter((n) => c === 'All' || n.category === c).length; },
});
