// Point d'entrée : styles, bibliothèques et composants Alpine de l'application.
import './styles/main.css';
import Alpine from 'alpinejs';
import moment from 'moment';
import 'flyonui/flyonui.js';

import { TODAY } from './js/data/demo.js';
import app from './js/app.js';
import login from './js/pages/login.js';
import dashboard from './js/pages/dashboard.js';
import projects from './js/pages/projects.js';
import { projectDetail, tasksTab, testsTab, notesTab, amendmentsTab, meetingsTab } from './js/pages/project-detail.js';
import tasks from './js/pages/tasks.js';
import tests from './js/pages/tests.js';
import notes from './js/pages/notes.js';
import amendments from './js/pages/amendments.js';
import meetings from './js/pages/meetings.js';
import teamSchedule from './js/pages/team-schedule.js';
import organisation from './js/pages/organisation.js';
import mySchedule from './js/pages/my-schedule.js';
import clientSpace from './js/pages/client-space.js';
import settings from './js/pages/settings.js';

// Dates affichées comme en-GB (« Sept »)
moment.updateLocale('en', { monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sept_Oct_Nov_Dec'.split('_') });

// Les gabarits utilisent moment(…) et TODAY directement, comme dans les maquettes
window.moment = moment;
window.TODAY = TODAY;
window.Alpine = Alpine;

Alpine.data('app', app);
Alpine.data('loginPage', login);
Alpine.data('dashboardPage', dashboard);
Alpine.data('projectsPage', projects);
Alpine.data('projectDetailPage', projectDetail);
Alpine.data('tasksTab', tasksTab);
Alpine.data('testsTab', testsTab);
Alpine.data('notesTab', notesTab);
Alpine.data('amendmentsTab', amendmentsTab);
Alpine.data('meetingsTab', meetingsTab);
Alpine.data('tasksPage', tasks);
Alpine.data('testsPage', tests);
Alpine.data('notesPage', notes);
Alpine.data('amendmentsPage', amendments);
Alpine.data('meetingsPage', meetings);
Alpine.data('teamSchedulePage', teamSchedule);
Alpine.data('organisationPage', organisation);
Alpine.data('mySchedulePage', mySchedule);
Alpine.data('clientSpacePage', clientSpace);
Alpine.data('settingsPage', settings);

Alpine.start();
