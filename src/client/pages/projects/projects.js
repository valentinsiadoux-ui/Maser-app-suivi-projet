// Projects page: project cards or table, with search and filters. Markup: projects.html.

export default () => ({
  fq: '',                // search text
  status: 'In Progress', // status filter (or All)
  priority: 'All',       // priority filter
  view: 'grid',          // grid | list
  get filtered() {
    const q = this.fq.trim().toLowerCase();
    return this.projects.filter((p) =>
      (this.status === 'All' || p.status === this.status) &&
      (this.priority === 'All' || p.priority === this.priority) &&
      (!q || [p.name, p.client, p.code, ...p.tags].some((s) => s.toLowerCase().includes(q))));
  },
});
