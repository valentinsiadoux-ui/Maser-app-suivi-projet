// Contract amendments ("avenants"): register, totals, approval workflow, "New amendment" dialog.
// Used by the Amendments page (pages/amendments) and the project's Amendments tab
// (pages/project-detail/tabs/amendments).
//
// Workflow: Draft → (submit) → Pending Approval → (approve, project leadership only) → Approved.
// The page or tab provides:
//   list                        amendments to show
//   defaultAmendmentProject     project pre-selected in the dialog
import { TODAY } from '../core/demo-data.js';

export const amendmentRegister = () => ({
  TYPES: ['Scope', 'Schedule', 'Budget'],
  dialog: { open: false },
  aform: { title: '', projectId: '', type: 'Scope', amount: '', days: '' },

  // ---------- register ----------
  get rows() { return [...this.list].reverse(); },
  get totals() {
    const L = this.list, ok = L.filter((a) => a.status === 'Approved');
    return [
      { label: 'Approved budget impact', value: this.eur(ok.reduce((s, a) => s + a.amount, 0)) },
      { label: 'Approved schedule impact', value: `+${ok.reduce((s, a) => s + a.daysImpact, 0)} days` },
      { label: 'Awaiting approval', value: String(L.filter((a) => a.status === 'Pending Approval').length) },
      { label: 'Drafts', value: String(L.filter((a) => a.status === 'Draft').length) },
    ];
  },

  // ---------- workflow ----------
  // approval: Admin, a manager of the project, the project lead — and their supervisors (core/permissions.js)
  canApprove(pid) { return this.canLead(this.getProject(pid)); },
  setStatus(a, status) { this.allAmendments = this.allAmendments.map((x) => (x.id === a.id ? { ...x, status } : x)); this.save('allAmendments'); },
  submitAmendment(a) { if (a.status === 'Draft') this.setStatus(a, 'Pending Approval'); },
  approve(a) { if (a.status === 'Pending Approval' && this.canApprove(a.projectId)) this.setStatus(a, 'Approved'); },

  // ---------- "New amendment" dialog ----------
  get validAmendment() { return this.aform.title.trim() && this.aform.projectId; },
  openNew() {
    this.aform = { title: '', projectId: this.defaultAmendmentProject, type: 'Scope', amount: '', days: '' };
    this.dialog.open = true;
    this.$nextTick(() => this.$refs.atitle && this.$refs.atitle.focus());
  },
  // references are numbered per project: AV-001, AV-002…
  saveAmendment() {
    if (!this.validAmendment) return;
    const f = this.aform, n = this.allAmendments.filter((x) => x.projectId === f.projectId).length + 1;
    this.allAmendments = [...this.allAmendments, {
      id: 'a' + Date.now(), projectId: f.projectId, ref: 'AV-' + String(n).padStart(3, '0'), title: f.title.trim(), type: f.type,
      status: 'Draft', amount: Number(f.amount) || 0, daysImpact: Number(f.days) || 0, requestedBy: this.user.id, createdAt: TODAY,
    }];
    this.save('allAmendments');
    this.dialog.open = false;
  },
  closeLocal() { this.dialog.open = false; },
});
