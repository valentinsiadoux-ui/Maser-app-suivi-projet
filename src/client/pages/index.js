// Every page of the app. To add one, see README › "Adding a page".
//
// Key = route name, used in links ("tasks.html") and in the URL.
//   component  Alpine component name, used by the page's outlet in index.html (x-data="…")
//   factory    the component (pages/<page>/<page>.js)
//   title      browser tab title
//   nav        menu entry highlighted while the page is shown
//   opt        optional page key: hidden unless enabled in Settings › Appearance
import login from './login/login.js';
import dashboard from './dashboard/dashboard.js';
import projects from './projects/projects.js';
import { projectDetail } from './project-detail/project-detail.js';
import tasks from './tasks/tasks.js';
import tests from './tests/tests.js';
import notes from './notes/notes.js';
import amendments from './amendments/amendments.js';
import meetings from './meetings/meetings.js';
import teamSchedule from './team-schedule/team-schedule.js';
import organisation from './organisation/organisation.js';
import mySchedule from './my-schedule/my-schedule.js';
import clientSpace from './client-space/client-space.js';
import settings from './settings/settings.js';
import { tasksTab } from './project-detail/tabs/tasks.js';
import { testsTab } from './project-detail/tabs/tests.js';
import { notesTab } from './project-detail/tabs/notes.js';
import { amendmentsTab } from './project-detail/tabs/amendments.js';
import { meetingsTab } from './project-detail/tabs/meetings.js';
import { halfGrid } from './team-schedule/half-day-grid.js';
import { myWeek } from './my-schedule/my-week.js';

export const DEFAULT_ROUTE = 'dashboard';

export const PAGES = {
  login: { component: 'loginPage', factory: login, title: 'Sign in' },
  dashboard: { component: 'dashboardPage', factory: dashboard, title: 'Dashboard', nav: 'dashboard.html' },
  projects: { component: 'projectsPage', factory: projects, title: 'Projects', nav: 'projects.html' },
  'project-detail': { component: 'projectDetailPage', factory: projectDetail, title: 'Project', nav: 'projects.html' },
  tasks: { component: 'tasksPage', factory: tasks, title: 'Tasks', nav: 'tasks.html', opt: 'tasks' },
  tests: { component: 'testsPage', factory: tests, title: 'Tests', nav: 'tests.html', opt: 'tests' },
  notes: { component: 'notesPage', factory: notes, title: 'Notes', nav: 'notes.html', opt: 'notes' },
  amendments: { component: 'amendmentsPage', factory: amendments, title: 'Amendments', nav: 'amendments.html', opt: 'amendments' },
  meetings: { component: 'meetingsPage', factory: meetings, title: 'Meetings', nav: 'meetings.html', opt: 'meetings' },
  'team-schedule': { component: 'teamSchedulePage', factory: teamSchedule, title: 'Team Schedule', nav: 'team-schedule.html' },
  organisation: { component: 'organisationPage', factory: organisation, title: 'Organisation', nav: 'organisation.html' },
  'my-schedule': { component: 'mySchedulePage', factory: mySchedule, title: 'My Schedule', nav: 'my-schedule.html' },
  'client-space': { component: 'clientSpacePage', factory: clientSpace, title: 'Client Space', nav: 'client-space.html' },
  settings: { component: 'settingsPage', factory: settings, title: 'Settings', nav: 'settings.html' },
};

// Components used inside a page (x-data="…" in the page's markup)
export const NESTED_COMPONENTS = { tasksTab, testsTab, notesTab, amendmentsTab, meetingsTab, halfGrid, myWeek };
