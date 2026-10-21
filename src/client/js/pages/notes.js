// Page « Notes » (maquette : mocks/notes.html)
import moment from 'moment';
import { TODAY } from '../data/demo.js';

export default () => ({
  CATEGORIES: ['Technical', 'Site Visit', 'Decision', 'Client'],
  fixedProject: null,          // ?project=p1 : notes d'un seul projet (comme l'onglet Notes d'un projet)
  filter: 'All', category: 'Technical', projectSel: '', draft: '',
  editing: { id: null, content: '' },
  openComments: {}, drafts: {},

  init() {
    this.usePage({ searchCtx: () => ({ project: this.fixedProject, kind: 'note' }) });
    const p = this.params.get('project');
    if (p && this.getProject(p) && this.canViewProject(p)) this.fixedProject = p;
    this.projectSel = this.fixedProject ?? (this.notableProjects[0]?.id ?? '');
    this.notes.forEach((n) => { if ((n.comments || []).length) this.openComments[n.id] = true; });
  },
  canViewProject(pid) {
    const p = this.getProject(pid); if (!p) return false;
    if (this.role === 'Admin' || this.role === 'Manager') return true;
    return this.access(p);
  },
  canEdit(pid) {
    if (this.role === 'Admin') return true;
    if (this.role === 'Client') return false;
    const p = this.getProject(pid);
    return !!p && this.access(p);
  },
  // projets où l'on peut ajouter une note : manager = ses projets ; collaborateur = les siens ; admin = tous
  get notableProjects() {
    if (this.role === 'Manager') return this.allProjects.filter((p) => p.memberIds.includes(this.user.id));
    if (this.role === 'Collaborator') return this.projects;
    return this.allProjects;
  },
  get canWrite() { return this.fixedProject ? this.canEdit(this.fixedProject) : this.notableProjects.length > 0; },
  get pool() { return this.notes.filter((n) => !this.fixedProject || n.projectId === this.fixedProject); },
  get visibleNotes() { return this.pool.filter((n) => this.filter === 'All' || n.category === this.filter); },
  countOf(c) { return this.pool.filter((n) => c === 'All' || n.category === c).length; },
  canEditNote(n) { return n.authorId === this.user.id || this.role === 'Admin'; },
  canComment(n) { return this.role === 'Client' || this.canEdit(n.projectId); },
  nowIso() { return TODAY + 'T' + moment().format('HH:mm:ss'); },
  persist() { try { localStorage.setItem('maser-notes', JSON.stringify(this.allNotes)); } catch (_) {} },

  post() {
    const text = this.draft.trim(); if (!text) return;
    const pid = this.fixedProject ?? this.projectSel;
    if (!this.canEdit(pid) && this.role !== 'Client') return;
    this.allNotes = [{ id: 'n' + Date.now(), projectId: pid, authorId: this.user.id, category: this.category, content: text, createdAt: this.nowIso(), comments: [] }, ...this.allNotes];
    this.draft = ''; this.persist();
  },
  startEdit(n) { this.editing = { id: n.id, content: n.content }; },
  saveEdit() {
    const c = this.editing.content.trim(); if (!c) return;
    this.allNotes = this.allNotes.map((x) => (x.id === this.editing.id ? { ...x, content: c } : x));
    this.editing = { id: null, content: '' }; this.persist();
  },
  remove(n) { this.allNotes = this.allNotes.filter((x) => x.id !== n.id); this.persist(); },
  toggleComments(n) { this.openComments = { ...this.openComments, [n.id]: !this.openComments[n.id] }; },
  postComment(n) {
    const text = (this.drafts[n.id] || '').trim(); if (!text) return;
    this.allNotes = this.allNotes.map((x) => (x.id === n.id ? { ...x, comments: [...(x.comments || []), { id: 'c' + Date.now(), authorId: this.user.id, content: text, createdAt: this.nowIso() }] } : x));
    this.drafts = { ...this.drafts, [n.id]: '' }; this.persist();
  },
});
