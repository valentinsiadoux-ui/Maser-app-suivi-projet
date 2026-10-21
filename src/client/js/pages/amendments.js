// Page « Avenants » (maquette : mocks/amendments.html)
import { TODAY } from '../data/demo.js';

export default () => ({
  TYPES: ['Scope', 'Schedule', 'Budget'],
  fixedProject: null,           // ?project=p1 : avenants d'un seul projet (comme l'onglet Amendments)
  dialog: { open: false },
  aform: { title: '', projectId: '', type: 'Scope', amount: '', days: '' },
  // chef de projet désigné (partagé avec la page de détail d'un projet)
  leads: (() => { try { return JSON.parse(localStorage.getItem('maser-leads') || '{}'); } catch (_) { return {}; } })(),

  init() {
    this.usePage({ close: () => { this.dialog.open = false; } });
    const p = this.params.get('project');
    if (p && this.projects.some((x) => x.id === p)) this.fixedProject = p;
  },
  eur(n) { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n); },

  // lecture : un collaborateur ne voit que les avenants de ses projets
  get list() {
    return this.allAmendments.filter((a) => (!this.scoped || this.pids.has(a.projectId)) && (!this.fixedProject || a.projectId === this.fixedProject));
  },
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

  // approbation : direction du projet = Admin, Manager du projet, chef de projet — et leurs supérieurs (héritage)
  leadOf(p) { return this.leads[p.id] ?? null; },
  canApprove(pid) {
    const p = this.getProject(pid); if (!p) return false;
    if (this.role === 'Admin') return true;
    return [this.user, ...this.subs(this.user.id)].some((m) => (this.eff(m) === 'Manager' && p.memberIds.includes(m.id)) || this.leadOf(p) === m.id);
  },

  persist() { try { localStorage.setItem('maser-amendments', JSON.stringify(this.allAmendments)); } catch (_) {} },
  setStatus(a, status) { this.allAmendments = this.allAmendments.map((x) => (x.id === a.id ? { ...x, status } : x)); this.persist(); },
  submitAmendment(a) { if (a.status === 'Draft') this.setStatus(a, 'Pending Approval'); },
  approve(a) { if (a.status === 'Pending Approval' && this.canApprove(a.projectId)) this.setStatus(a, 'Approved'); },

  // dialogue « New amendment »
  get validAmendment() { return this.aform.title.trim() && this.aform.projectId; },
  openNew() {
    this.aform = { title: '', projectId: this.fixedProject ?? (this.projects[0]?.id ?? ''), type: 'Scope', amount: '', days: '' };
    this.dialog.open = true;
    this.$nextTick(() => this.$refs.atitle && this.$refs.atitle.focus());
  },
  saveAmendment() {
    if (!this.validAmendment) return;
    const f = this.aform, n = this.allAmendments.filter((x) => x.projectId === f.projectId).length + 1;
    this.allAmendments = [...this.allAmendments, {
      id: 'a' + Date.now(), projectId: f.projectId, ref: 'AV-' + String(n).padStart(3, '0'), title: f.title.trim(), type: f.type,
      status: 'Draft', amount: Number(f.amount) || 0, daysImpact: Number(f.days) || 0, requestedBy: this.user.id, createdAt: TODAY,
    }];
    this.persist(); this.dialog.open = false;
  },
});
