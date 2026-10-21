// Page « Organisation » (maquette : mocks/organisation.html)
import moment from 'moment';

export default () => ({
  NONE: '__none__',
  get canSeePage() { return !this.isClient; },
  get staffAll() { return this.members.filter((m) => m.role !== 'Client'); },
  get myBranch() { return this.subs(this.user.id); },   // les personnes placées sous moi (directement ou non)
  get hasBranch() { return this.myBranch.length > 0; },
  get intro() {
    if (this.role === 'Admin') return 'Everyone can view the organisation. As an administrator you can change any reporting line.';
    return this.hasBranch
      ? 'Everyone can view the organisation. You can reorganise the people below you: move them under you or under someone else in your branch.'
      : 'Everyone can view the organisation. You have nobody below you yet, so this view is read-only for you.';
  },
  // un administrateur modifie tout ; les autres uniquement les personnes de leur branche (jamais eux-mêmes)
  canEditPerson(id) { return this.role === 'Admin' || this.myBranch.some((s) => s.id === id); },
  // supérieurs possibles pour une personne : jamais elle-même ni ses propres subordonnés (pas de boucle)
  optionsFor(m) {
    const forbidden = new Set([m.id, ...this.subs(m.id).map((s) => s.id)]);
    const pool = this.role === 'Admin' ? this.staffAll : [this.user, ...this.myBranch];
    const list = pool.filter((s) => !forbidden.has(s.id)).map((s) => ({ value: s.id, label: s.name + (s.id === this.user.id ? ' (you)' : '') }));
    return this.role === 'Admin' ? [{ value: this.NONE, label: 'No supervisor (top level)' }, ...list] : list;
  },
  // arbre à plat : [{ member, depth }] (racines = sans supérieur)
  get tree() {
    const staff = this.staffAll, rows = [], seen = new Set();
    const visit = (m, depth) => {
      if (seen.has(m.id)) return;
      seen.add(m.id); rows.push({ member: m, depth });
      staff.filter((x) => x.supervisorId === m.id).forEach((c) => visit(c, depth + 1));
    };
    staff.filter((m) => !m.supervisorId || !staff.some((s) => s.id === m.supervisorId)).forEach((m) => visit(m, 0));
    staff.forEach((m) => visit(m, 0)); // sécurité (cycle éventuel)
    return rows.map((r) => {
      const subs = this.subs(r.member.id), nb = this.allProjects.filter((p) => p.memberIds.includes(r.member.id)).length;
      const sup = r.member.supervisorId ? this.getMember(r.member.supervisorId) : null, eff = this.eff(r.member);
      return {
        ...r, me: r.member.id === this.user.id, editable: this.canEditPerson(r.member.id), eff, inherited: eff !== r.member.role,
        info: `${r.member.title} · ${subs.length} below · ${nb} project${nb === 1 ? '' : 's'}`,
        current: r.member.supervisorId ?? this.NONE, reportsTo: sup ? sup.name : '—', options: this.optionsFor(r.member),
      };
    });
  },
  // changer le supérieur d'une personne (contrôle des droits côté données, journal d'activité)
  setSupervisor(id, value) {
    const m = this.getMember(id); if (!m || !this.canEditPerson(id)) return;
    const sup = value === this.NONE ? null : value;
    if (!this.optionsFor(m).some((o) => o.value === value)) return;
    let o = {}; try { o = JSON.parse(localStorage.getItem('maser-supervisors') || '{}'); } catch (_) {}
    o[id] = sup; localStorage.setItem('maser-supervisors', JSON.stringify(o));
    this.members = this.members.map((x) => (x.id === id ? { ...x, supervisorId: sup || undefined } : x));
    // journal d'activité (affiché dans Settings > Activity log)
    let log = []; try { log = JSON.parse(localStorage.getItem('maser-log') || '[]'); } catch (_) {}
    log.unshift({ id: 'l' + Date.now(), type: 'Access', who: this.user.id, what: `changed the supervisor of ${m.name} to ${sup ? this.getMember(sup).name : 'nobody'}`, code: '', when: 'Today, ' + moment().format('HH:mm') });
    localStorage.setItem('maser-log', JSON.stringify(log.slice(0, 50)));
  },
});
