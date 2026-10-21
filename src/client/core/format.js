// Display helpers available in every template: dates, money, avatars, badge colours.
import moment from 'moment';
import { TODAY } from './demo-data.js';
import {
  PALETTE, TONES, PRIORITY_TONE, TASK_TONE, DEADLINE, PROJECT_TONE, ROLE_TONE,
  AMENDMENT_TONE, TEST_TONE, CAT_TONE, TASK_BAR,
} from './tones.js';

export const format = () => ({
  // badge colours by status / priority / role… (see core/tones.js)
  TONES, ROLE_TONE, PRIORITY_TONE, TASK_TONE, DEADLINE, PROJECT_TONE, AMENDMENT_TONE, TEST_TONE, CAT_TONE, TASK_BAR,

  // ---------- dates (Moment.js; "today" is fixed by the demo data) ----------
  daysUntil(d) { return moment(d).startOf('day').diff(moment(TODAY), 'days'); },
  // overdue | soon (≤ 14 days) | on-track | complete
  deadlineState(end, done) {
    if (done) return 'complete';
    const n = this.daysUntil(end);
    return n < 0 ? 'overdue' : n <= 14 ? 'soon' : 'on-track';
  },
  fd(d, f = 'D MMM') { return moment(d).format(f); },
  ft(d) { return moment(d).format('HH:mm'); },
  fdt(d) { return moment(d).format('D MMM') + ' · ' + moment(d).format('HH:mm'); },
  // timestamp for new notes and comments
  nowIso() { return TODAY + 'T' + moment().format('HH:mm:ss'); },

  // ---------- money, places ----------
  eur(n) { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n); },
  isOnline(m) { return /meet|teams|zoom/i.test(m.location); },

  // ---------- avatars ----------
  // stable colour for a person
  color(id) { return PALETTE[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length]; },
  // first `max` people of a list, and how many are left
  stack(ids, max = 4) { return ids.slice(0, max).map((id) => this.getMember(id)).filter(Boolean); },
  rest(ids, max = 4) { return Math.max(0, ids.length - max); },
});
