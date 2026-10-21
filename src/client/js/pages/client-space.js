// Page « Espace client » (maquette : mocks/client-space.html)
import moment from 'moment';
import { TODAY } from '../data/demo.js';

export default () => ({
  selected: '',
  draft: '', editing: { id: null, content: '' }, openComments: {}, drafts: {},

  // le client voit son entreprise ; un membre du personnel voit l'aperçu du premier compte client
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
  init() {
    const p = this.params.get('project');
    this.selected = (p && this.clientProjects.some((x) => x.id === p)) ? p : (this.clientProjects[0]?.id ?? '');
    this.notes.forEach((n) => { if ((n.comments || []).length) this.openComments[n.id] = true; });
  },
  get cp() { return this.getProject(this.selected); },
  get cpProgress() { return this.cp ? this.progress(this.cp) : 0; },
  get cpMilestones() { return this.milestones.filter((m) => m.projectId === this.selected).sort((a, b) => a.date.localeCompare(b.date)).map((m) => ({ ...m, done: m.date < TODAY })); },
  get cpAmendments() { return this.allAmendments.filter((a) => a.projectId === this.selected && a.status !== 'Draft'); },
  get cpContacts() { return this.cp ? this.members.filter((m) => this.cp.memberIds.includes(m.id) && (m.role === 'Manager' || m.role === 'Admin')) : []; },
  eur(n) { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n); },

  // réunions (lecture seule)
  get cpMeetings() { return this.meetings.filter((m) => m.projectId === this.selected).sort((a, b) => a.start.localeCompare(b.start)); },
  get upcoming() { return this.cpMeetings.filter((m) => m.start.slice(0, 10) >= TODAY); },
  get past() { return this.cpMeetings.filter((m) => m.start.slice(0, 10) < TODAY).reverse(); },
  isOnline(m) { return /meet|teams|zoom/i.test(m.location); },

  // messages = notes de catégorie « Client » du projet
  get cpNotes() { return this.notes.filter((n) => n.projectId === this.selected && n.category === 'Client'); },
  canEdit(pid) {
    if (this.role === 'Admin') return true;
    if (this.role === 'Client') return false;
    const p = this.getProject(pid);
    return !!p && this.access(p);
  },
  canEditNote(n) { return n.authorId === this.user.id || this.role === 'Admin'; },
  canComment(n) { return this.role === 'Client' || this.canEdit(n.projectId); },
  nowIso() { return TODAY + 'T' + moment().format('HH:mm:ss'); },
  persist() { try { localStorage.setItem('maser-notes', JSON.stringify(this.allNotes)); } catch (_) {} },
  post() {
    const text = this.draft.trim(); if (!text || !this.selected) return;
    this.allNotes = [{ id: 'n' + Date.now(), projectId: this.selected, authorId: this.user.id, category: 'Client', content: text, createdAt: this.nowIso(), comments: [] }, ...this.allNotes];
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
