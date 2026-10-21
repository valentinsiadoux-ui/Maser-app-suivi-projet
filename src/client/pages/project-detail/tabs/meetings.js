// Project › Meetings tab: the meetings of this project only.
// Logic: features/meeting-planner.js. Markup: tabs/meetings.html.
// Nested in the project page: `project` and `canLeadProject` come from project-detail.js.
import { compose } from '../../../core/compose.js';
import { meetingLists, meetingPlanner } from '../../../features/meeting-planner.js';

export const meetingsTab = () => compose(meetingLists(), meetingPlanner(), {
  get list() { return this.meetings.filter((m) => m.projectId === this.project.id).sort((a, b) => a.start.localeCompare(b.start)); },
  get canSchedule() { return this.canLeadProject; },
  get defaultMeetingProject() { return this.project.id; },
});
