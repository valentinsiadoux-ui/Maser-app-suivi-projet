// Profile menu (header): view the app as another role or person (prototype), menu position,
// settings, sign out. Markup: layout/profile-menu.html.
import { KEYS } from '../core/store.js';

// person used when switching to a role
const DEFAULT_USER = { Admin: 'u1', Manager: 'u2', Collaborator: 'u3', Client: 'u7' };

export const profileMenu = () => ({
  profileOpen: false,
  roles: [
    { role: 'Admin', description: 'Full access & settings' },
    { role: 'Manager', description: 'Manage their projects & team' },
    { role: 'Collaborator', description: 'Work on assigned tasks' },
    { role: 'Client', description: 'Client Space only' },
  ],
  switchRole(next) {
    localStorage.setItem(KEYS.user, DEFAULT_USER[next]);
    this.userId = DEFAULT_USER[next];
    this.profileOpen = false;
    if (next === 'Client') this.go('client-space.html');
  },
  switchUser(id) { localStorage.setItem(KEYS.user, id); this.userId = id; this.profileOpen = false; },
});
