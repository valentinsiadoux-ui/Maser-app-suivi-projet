// Meetings: upcoming / past lists and the "Schedule a meeting" dialog.
// Used by the Meetings page (pages/meetings), the project's Meetings tab
// (pages/project-detail/tabs/meetings) and, read-only, the Client Space (pages/client-space).
import { TODAY } from '../core/demo-data.js';

// Upcoming and past meetings. The page provides `list`: its meetings sorted by start.
export const meetingLists = () => ({
  get upcoming() { return this.list.filter((m) => m.start.slice(0, 10) >= TODAY); },
  get past() { return this.list.filter((m) => m.start.slice(0, 10) < TODAY).reverse(); },
});

// "Schedule a meeting" dialog: saves the meeting, then opens Google Calendar to invite people.
// Only the project leadership may schedule (core/permissions.js canLead).
// The page provides `canSchedule` and `defaultMeetingProject`.
export const meetingPlanner = () => ({
  DURATIONS: [{ v: '30', l: '30 minutes' }, { v: '45', l: '45 minutes' }, { v: '60', l: '1 hour' }, { v: '90', l: '1.5 hours' }, { v: '120', l: '2 hours' }],
  dialog: { open: false },
  mform: { title: '', projectId: '', start: '2026-10-23T10:00', duration: '60', location: 'Google Meet' },

  get validMeeting() { return this.mform.title.trim() && this.mform.projectId && this.mform.start; },
  openSchedule() {
    this.mform = { title: '', projectId: this.defaultMeetingProject, start: '2026-10-23T10:00', duration: '60', location: 'Google Meet' };
    this.dialog.open = true;
    this.$nextTick(() => this.$refs.mtitle && this.$refs.mtitle.focus());
  },
  saveMeeting() {
    if (!this.validMeeting) return;
    const f = this.mform, p = this.getProject(f.projectId); if (!p || !this.canLead(p)) return;
    const durationMin = Number(f.duration) || 60;
    this.allMeetings = [...this.allMeetings, {
      id: 'm' + Date.now(), projectId: f.projectId, title: f.title.trim(), start: f.start + ':00', durationMin, location: f.location,
      attendeeIds: p.memberIds.slice(0, 4),
    }];
    this.saveData('allMeetings');
    const params = new URLSearchParams({ action: 'TEMPLATE', text: `${f.title.trim()} — ${p.name}`, dates: `${this.gcalDate(f.start)}/${this.gcalDate(f.start, durationMin)}`, details: `Maser Engineering project meeting (${p.code})`, location: f.location });
    window.open('https://calendar.google.com/calendar/render?' + params.toString(), '_blank', 'noopener,noreferrer');
    this.dialog.open = false;
  },
  // '2026-10-23T10:00' (+ minutes) → '20261023T080000Z' (Google Calendar format)
  gcalDate(local, addMin = 0) { return new Date(new Date(local).getTime() + addMin * 60000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); },
  closeLocal() { this.dialog.open = false; },
});
