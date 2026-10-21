// Root Alpine component (<body x-data="app">): everything the shell and every page share.
// Each page is a nested component (pages/<page>/<page>.js) and can use all of this through `this`.
import { compose } from './compose.js';
import { store } from './store.js';
import { session } from './session.js';
import { permissions } from './permissions.js';
import { format } from './format.js';
import { router } from './router.js';
import { navigation } from '../layout/navigation.js';
import { search } from '../layout/search.js';
import { notifications } from '../layout/notifications.js';
import { profileMenu } from '../layout/profile-menu.js';
import { createProject } from '../layout/create-project.js';

export default () => compose(
  store(),         // data: projects, tasks, tests… and save()
  session(),       // signed-in person, role, what they can see
  permissions(),   // what they can change
  format(),        // dates, money, colours
  router(),        // current page, go(), URL
  navigation(),    // menu
  search(),        // header search
  notifications(), // header notifications
  profileMenu(),   // header profile menu
  createProject(), // "Create project" dialog
  {
    // Escape key: close every menu, dialog and drawer (including the current page's ones)
    closeAll() { this.pageApi?.close?.(); this.mobileOpen = false; this.createOpen = false; this.profileOpen = false; this.notifOpen = false; this.searchOpen = false; this.projMenu.open = false; },
  },
);
