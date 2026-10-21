// Team Schedule page (Admin & Manager): who works on which project, and when.
// Admin sees all staff; a manager sees themself and the people below them.
// Views: half-day planning grid (default, half-day-grid.js), timeline and list (features/staff-schedule.js).
// Markup: team-schedule.html (+ half-day-grid.html).
import { compose } from '../../core/compose.js';
import { staffSchedule } from '../../features/staff-schedule.js';

export default () => compose(staffSchedule(), {
  view: 'half', // half | timeline | list

  get canSeePage() { return this.role === 'Admin' || this.role === 'Manager'; },
  get staff() {
    if (this.role === 'Admin') return this.members.filter((m) => m.role !== 'Client');
    if (this.role === 'Manager') return [this.user, ...this.subs(this.user.id)];
    return [];
  },
  get pageDescription() {
    return this.role === 'Admin'
      ? 'Who is working on which project, and over which period. Admin view of staff allocation.'
      : 'Who is working on which project, and over which period, for you and the people reporting to you.';
  },
});
