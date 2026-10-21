// Page « Liste des projets » (maquette : mocks/projects.html)

export default () => ({
  fq: '', status: 'In Progress', priority: 'All', view: 'grid',
  get filtered() {
    const q = this.fq.trim().toLowerCase();
    return this.projects.filter((p) =>
      (this.status === 'All' || p.status === this.status) &&
      (this.priority === 'All' || p.priority === this.priority) &&
      (!q || [p.name, p.client, p.code, ...p.tags].some((s) => s.toLowerCase().includes(q))));
  },
});
