// Meetings page: upcoming and past meetings across the projects I can see.
// Logic: features/meeting-planner.js. Markup: meetings.html (+ meetings.overlays.html: dialog).
// Optional page (Settings › Appearance). ?project=p1 shows the meetings of one project only.
import { compose } from '../../core/compose.js';
import { meetingLists, meetingPlanner } from '../../features/meeting-planner.js';

export default () => compose(meetingLists(), meetingPlanner(), {
  fixedProject: null, // ?project=p1

  init() {
    this.usePage({ close: () => this.closeLocal() });
    const p = this.params.get('project');
    if (p && this.projects.some((x) => x.id === p)) this.fixedProject = p;
  },

  get list() {
    return this.meetings.filter((m) => !this.fixedProject || m.projectId === this.fixedProject).sort((a, b) => a.start.localeCompare(b.start));
  },
  // projects I can schedule meetings for
  get leadable() { return this.projects.filter((p) => this.canLead(p)); },
  get canSchedule() { return this.fixedProject ? this.canLead(this.getProject(this.fixedProject)) : this.leadable.length > 0; },
  get defaultMeetingProject() { return this.fixedProject ?? (this.leadable[0]?.id ?? ''); },
});
