// Who may change what. Every page asks these rules instead of re-implementing them.
// (Read rights — what someone can see — are in core/session.js.)
export const permissions = () => ({
  // edit tasks, test results, notes of a project: a member of the project or someone above a member
  // (Admin: every project; a client never edits)
  canEdit(pid) {
    if (this.role === 'Admin') return true;
    if (this.role === 'Client') return false;
    const p = this.getProject(pid);
    return !!p && this.access(p);
  },

  // ---------- project leadership ----------
  // the designated project lead (assigned in the project's Team tab), or null
  leadOf(p) { return this.leads[p.id] ?? null; },
  // lead a project (approve amendments, schedule meetings): Admin, a manager of the project,
  // the designated lead — and the people above them
  canLead(p) {
    if (!p) return false;
    if (this.role === 'Admin') return true;
    return [this.user, ...this.subs(this.user.id)].some((m) => (this.eff(m) === 'Manager' && p.memberIds.includes(m.id)) || this.leadOf(p) === m.id);
  },
  // designate (or remove, if already the lead) the lead of a project
  toggleLead(p, memberId) {
    const next = { ...this.leads };
    if (memberId && next[p.id] !== memberId) next[p.id] = memberId; else delete next[p.id];
    this.leads = next;
    this.save('leads');
  },
});
