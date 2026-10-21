// "Create project" dialog, opened from the menu. Visual only for now: it goes to the project list.
// Markup: layout/create-project.html.

export const createProject = () => ({
  createOpen: false,
  form: { name: '', client: '', priority: 'Medium', startDate: '2026-10-19', endDate: '2027-03-26', tags: '', budget: '', description: '' },
  openCreate() { this.mobileOpen = false; this.createOpen = true; this.$nextTick(() => this.$refs.pname && this.$refs.pname.focus()); },
  get validForm() { return this.form.name.trim() && this.form.client.trim() && this.form.startDate && this.form.endDate >= this.form.startDate; },
  submitProject() { if (this.validForm) this.go('projects.html'); },
});
