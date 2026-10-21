// Page « Réunions » (maquette : mocks/meetings.html)
import { TODAY } from '../data/demo.js';

export default () => ({
  DURATIONS: [{ v: '30', l: '30 minutes' }, { v: '45', l: '45 minutes' }, { v: '60', l: '1 hour' }, { v: '90', l: '1.5 hours' }, { v: '120', l: '2 hours' }],
  fixedProject: null,            // ?project=p1 : réunions d'un seul projet (comme l'onglet Meetings)
  dialog: { open: false },
  mform: { title: '', projectId: '', start: '2026-10-23T10:00', duration: '60', location: 'Google Meet' },
  // chef de projet désigné (partagé avec la page de détail d'un projet)
  leads: (() => { try { return JSON.parse(localStorage.getItem('maser-leads') || '{}'); } catch (_) { return {}; } })(),

  init() {
    this.usePage({ close: () => { this.dialog.open = false; } });
    const p = this.params.get('project');
    if (p && this.projects.some((x) => x.id === p)) this.fixedProject = p;
  },

  // lecture : un collaborateur ne voit que les réunions de ses projets
  get list() {
    return this.meetings.filter((m) => !this.fixedProject || m.projectId === this.fixedProject).sort((a, b) => a.start.localeCompare(b.start));
  },
  get upcoming() { return this.list.filter((m) => m.start.slice(0, 10) >= TODAY); },
  get past() { return this.list.filter((m) => m.start.slice(0, 10) < TODAY).reverse(); },
  isOnline(m) { return /meet|teams|zoom/i.test(m.location); },

  // création : direction du projet = Admin, Manager du projet, chef de projet — et leurs supérieurs (héritage)
  leadOf(p) { return this.leads[p.id] ?? null; },
  canLead(p) {
    if (this.role === 'Admin') return true;
    return [this.user, ...this.subs(this.user.id)].some((m) => (this.eff(m) === 'Manager' && p.memberIds.includes(m.id)) || this.leadOf(p) === m.id);
  },
  get leadable() { return this.projects.filter((p) => this.canLead(p)); },
  get canSchedule() {
    if (this.fixedProject) { const p = this.getProject(this.fixedProject); return !!p && this.canLead(p); }
    return this.leadable.length > 0;
  },
  persist() { try { localStorage.setItem('maser-meetings', JSON.stringify(this.allMeetings)); } catch (_) {} },

  // dialogue « Schedule a meeting »
  get validMeeting() { return this.mform.title.trim() && this.mform.projectId && this.mform.start; },
  openSchedule() {
    this.mform = { title: '', projectId: this.fixedProject ?? (this.leadable[0]?.id ?? ''), start: '2026-10-23T10:00', duration: '60', location: 'Google Meet' };
    this.dialog.open = true;
    this.$nextTick(() => this.$refs.mtitle && this.$refs.mtitle.focus());
  },
  gcalDate(local, addMin = 0) { return new Date(new Date(local).getTime() + addMin * 60000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); },
  saveMeeting() {
    if (!this.validMeeting) return;
    const f = this.mform, p = this.getProject(f.projectId); if (!p || !this.canLead(p)) return;
    const durationMin = Number(f.duration) || 60;
    this.allMeetings = [...this.allMeetings, {
      id: 'm' + Date.now(), projectId: f.projectId, title: f.title.trim(), start: f.start + ':00', durationMin, location: f.location,
      attendeeIds: p.memberIds.slice(0, 4),
    }];
    this.persist();
    // comme dans l'application : ouverture de Google Agenda pour inviter les participants
    const params = new URLSearchParams({ action: 'TEMPLATE', text: `${f.title.trim()} — ${p.name}`, dates: `${this.gcalDate(f.start)}/${this.gcalDate(f.start, durationMin)}`, details: `Maser Engineering project meeting (${p.code})`, location: f.location });
    window.open('https://calendar.google.com/calendar/render?' + params.toString(), '_blank', 'noopener,noreferrer');
    this.dialog.open = false;
  },
});
