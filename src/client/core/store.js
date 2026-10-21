// Application data: every collection, and how it is saved.
//
// Today the data comes from core/demo-data.js and changes are kept in the browser (localStorage).
// This is the single place to change when the data moves to the Google Sheet (google.script.run):
// load the collections in store() and write them in save().
import { DATA } from './demo-data.js';

// Every localStorage key used by the app
export const KEYS = {
  allTasks: 'maser-tasks',
  allTests: 'maser-tests',
  allMeetings: 'maser-meetings',
  allNotes: 'maser-notes',
  allAmendments: 'maser-amendments',
  leads: 'maser-leads',             // { projectId: memberId } designated project leads
  supervisors: 'maser-supervisors', // { memberId: supervisorId | null } reporting lines changed in Organisation
  activityLog: 'maser-log',         // entries shown in Settings › Activity log
  user: 'maser-user',               // signed-in person (prototype role switcher)
  prefs: 'maser-prefs-v1',          // display preferences (see core/preferences.js)
};

export const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; }
};
export const writeJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
};

// Activity log (read by Settings, written by Organisation)
export const readActivityLog = () => readJSON(KEYS.activityLog, []);
export const logActivity = (entry) => writeJSON(KEYS.activityLog, [{ id: 'l' + Date.now(), ...entry }, ...readActivityLog()].slice(0, 50));

const withSupervisorOverrides = (members) => {
  const o = readJSON(KEYS.supervisors, {});
  return members.map((m) => (m.id in o ? { ...m, supervisorId: o[m.id] || undefined } : m));
};

export const store = () => ({
  // read-only reference data
  allProjects: DATA.allProjects,
  milestones: DATA.milestones,
  notifications: DATA.notifications,
  // editable collections
  members: withSupervisorOverrides(DATA.members),
  allTasks: readJSON(KEYS.allTasks, null) || DATA.allTasks,
  allTests: readJSON(KEYS.allTests, null) || DATA.allTests,
  allMeetings: readJSON(KEYS.allMeetings, null) || DATA.allMeetings,
  allNotes: readJSON(KEYS.allNotes, null) || DATA.allNotes,
  allAmendments: readJSON(KEYS.allAmendments, null) || DATA.allAmendments,
  leads: readJSON(KEYS.leads, {}),

  // save a collection after changing it: this.allTasks = […]; this.save('allTasks')
  save(name) { writeJSON(KEYS[name], this[name]); },

  // change who a person reports to (null = top level)
  setSupervisorOf(id, supervisorId) {
    writeJSON(KEYS.supervisors, { ...readJSON(KEYS.supervisors, {}), [id]: supervisorId });
    this.members = this.members.map((m) => (m.id === id ? { ...m, supervisorId: supervisorId || undefined } : m));
  },
});
