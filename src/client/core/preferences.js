// Display preferences (Settings › Appearance and the profile menu), saved in the browser.
// They are applied as attributes on <html> (data-theme, data-palette, data-density, data-nav)
// that styles/tokens.css reacts to.
// Note: index.html has a tiny inline copy of applyPrefs() so the theme is set before the first paint.
import { KEYS, readJSON, writeJSON } from './store.js';

export const DEFAULT_PREFS = {
  theme: 'system',         // light | dark | system
  palette: 'maser',        // maser | ocean | forest | sunset | violet | graphite
  density: 'comfortable',  // compact | comfortable | large
  taskView: 'board',       // board | list (default view of task boards)
  navLayout: 'side',       // side | top (menu position)
  optPages: { tasks: false, tests: false, notes: false, amendments: false, meetings: false }, // optional menu pages
};

export function readPrefs() {
  const saved = readJSON(KEYS.prefs, {});
  return { ...DEFAULT_PREFS, ...saved, optPages: { ...DEFAULT_PREFS.optPages, ...(saved.optPages || {}) } };
}

export function writePrefs(prefs) { writeJSON(KEYS.prefs, prefs); }

// change some preferences, keep the others
export function updatePrefs(patch) { writePrefs({ ...readJSON(KEYS.prefs, {}), ...patch }); }

export function applyPrefs(p = readPrefs()) {
  const e = document.documentElement;
  p.theme === 'system' ? e.removeAttribute('data-theme') : e.setAttribute('data-theme', p.theme);
  p.palette === 'maser' ? e.removeAttribute('data-palette') : e.setAttribute('data-palette', p.palette);
  p.density === 'comfortable' ? e.removeAttribute('data-density') : e.setAttribute('data-density', p.density);
  p.navLayout === 'side' ? e.removeAttribute('data-nav') : e.setAttribute('data-nav', p.navLayout);
}
