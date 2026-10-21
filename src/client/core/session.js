// The signed-in person, their role and what they can see.
//
// Roles: Admin, Manager, Collaborator, Client. Someone placed above a manager in the
// organisation (directly or not) gets manager rights: see eff().
// In this prototype the person can be switched from the profile menu (layout/profile-menu.js).
import { KEYS } from './store.js';

export const session = () => ({
  userId: localStorage.getItem(KEYS.user) || 'u2',

  get user() { return this.members.find((m) => m.id === this.userId) || this.members[1]; },
  get role() { return this.eff(this.user); },
  get isClient() { return this.role === 'Client'; },
  // people with the same role as me (profile menu: "Switch person")
  get sameRole() { return this.members.filter((m) => this.eff(m) === this.role); },

  // ---------- organisation (reporting lines) ----------
  // everyone below a person, directly or not
  subs(id) {
    const out = [], seen = new Set([id]), q = [id];
    while (q.length) { const x = q.shift(); this.members.forEach((m) => { if (m.supervisorId === x && !seen.has(m.id)) { seen.add(m.id); out.push(m); q.push(m.id); } }); }
    return out;
  },
  // effective role: a collaborator placed above a manager acts as a manager
  eff(m) { return m.role === 'Collaborator' && this.subs(m.id).some((s) => s.role === 'Manager') ? 'Manager' : m.role; },

  // ---------- what I can see ----------
  // a project is "mine" if I or someone below me works on it (Admin: every project)
  access(p) {
    if (this.role === 'Admin') return true;
    return [this.user, ...this.subs(this.user.id)].some((m) => p.memberIds.includes(m.id));
  },
  // a collaborator only sees their projects; Admin and Manager see everything
  get scoped() { return this.role === 'Collaborator'; },
  get projects() { return this.scoped ? this.allProjects.filter((p) => this.access(p)) : this.allProjects; },
  get pids() { return new Set(this.projects.map((p) => p.id)); },
  get tasks() { return this.scoped ? this.allTasks.filter((t) => this.pids.has(t.projectId)) : this.allTasks; },
  get tests() { return this.scoped ? this.allTests.filter((t) => this.pids.has(t.projectId)) : this.allTests; },
  get meetings() { return this.scoped ? this.allMeetings.filter((m) => this.pids.has(m.projectId)) : this.allMeetings; },
  get notes() {
    const team = new Set([this.user, ...this.subs(this.user.id)].map((m) => m.id));
    return this.allNotes.filter((n) => {
      const p = this.getProject(n.projectId);
      if (this.role === 'Collaborator') return !!p && this.access(p);
      if (this.role === 'Manager') return !!p && (p.memberIds.includes(this.user.id) || team.has(n.authorId));
      return true;
    });
  },

  // ---------- lookups ----------
  getMember(id) { return this.members.find((m) => m.id === id); },
  getProject(id) { return this.allProjects.find((p) => p.id === id); },
  // project progress in %, from the status of its tasks
  progress(p) {
    const l = this.allTasks.filter((t) => t.projectId === p.id);
    if (!l.length) return 0;
    const s = l.reduce((a, t) => a + (t.status === 'Done' ? 1 : t.status === 'Review' ? 0.75 : t.status === 'In Progress' ? 0.4 : 0), 0);
    return Math.round((s / l.length) * 100);
  },
});
