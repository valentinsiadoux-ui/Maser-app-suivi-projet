// Entry point: styles, libraries (npm) and every Alpine component.
import './styles/main.css';
import Alpine from 'alpinejs';
import moment from 'moment';
import 'flyonui/flyonui.js';

import { TODAY } from './core/demo-data.js';
import app from './core/app.js';
import { PAGES, NESTED_COMPONENTS } from './pages/index.js';

// Short month names as in en-GB ("Sept")
moment.updateLocale('en', { monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sept_Oct_Nov_Dec'.split('_') });

// Templates call moment(…) and TODAY directly, as in the mockups
window.moment = moment;
window.TODAY = TODAY;
window.Alpine = Alpine;

Alpine.data('app', app);
for (const page of Object.values(PAGES)) Alpine.data(page.component, page.factory);
for (const [name, factory] of Object.entries(NESTED_COMPONENTS)) Alpine.data(name, factory);

Alpine.start();
