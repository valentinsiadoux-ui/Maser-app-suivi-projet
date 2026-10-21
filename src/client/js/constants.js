// Couleurs et correspondances d'affichage partagées par toutes les pages (reprises des maquettes).

export const PALETTE = [
  'bg-primary text-primary-foreground',
  'bg-success text-success-foreground',
  'bg-chart-5 text-primary-foreground',
  'bg-[oklch(.62_.14_70)] text-white',
  'bg-[#4f4c4d] text-white',
];
export const TONES = {
  navy: 'bg-alt/12 text-alt-ink border-alt/25',
  green: 'bg-success/12 text-success-ink border-success/25',
  amber: 'bg-warning/12 text-warning-ink border-warning/25',
  red: 'bg-destructive/12 text-destructive-ink border-destructive/25',
  slate: 'bg-muted-foreground/12 text-muted-ink border-muted-foreground/25',
};
export const PRIORITY_TONE = { High: 'red', Medium: 'amber', Low: 'slate' };
export const TASK_TONE = { 'To Do': 'slate', 'In Progress': 'navy', Review: 'amber', Done: 'green' };
export const DEADLINE = { overdue: ['Overdue', 'red'], soon: ['Due soon', 'amber'], 'on-track': ['On track', 'green'], complete: ['Delivered', 'slate'] };
export const PROJECT_TONE = { 'In Progress': 'navy', Closed: 'green', Archived: 'slate' };
export const ROLE_TONE = { Admin: 'bg-primary text-primary-foreground', Manager: 'bg-success/14 text-success-ink', Collaborator: 'bg-muted text-muted-foreground', Client: 'bg-warning/14 text-warning-ink' };
export const DEFAULT_USER = { Admin: 'u1', Manager: 'u2', Collaborator: 'u3', Client: 'u7' };
export const AMENDMENT_TONE = { Draft: 'slate', 'Pending Approval': 'amber', Approved: 'green' };
export const TEST_TONE = { Passed: 'green', Failed: 'red', Pending: 'amber' };
export const CAT_TONE = { Technical: 'bg-alt/14 text-alt-ink', 'Site Visit': 'bg-success/14 text-success-ink', Decision: 'bg-warning/14 text-warning-ink', Client: 'bg-chart-5/14 text-chart-5-ink' };
export const TASK_BAR = { 'To Do': 'bg-muted-foreground/35', 'In Progress': 'bg-primary', Review: 'bg-warning', Done: 'bg-success' };

// Pages de l'application : fichier de la maquette → entrée de menu active, page facultative, titre
export const ROUTES = {
  login: { title: 'Sign in' },
  dashboard: { nav: 'dashboard.html', title: 'Dashboard' },
  projects: { nav: 'projects.html', title: 'Projects' },
  'project-detail': { nav: 'projects.html', title: 'Project' },
  tasks: { nav: 'tasks.html', opt: 'tasks', title: 'Tasks' },
  tests: { nav: 'tests.html', opt: 'tests', title: 'Tests' },
  notes: { nav: 'notes.html', opt: 'notes', title: 'Notes' },
  amendments: { nav: 'amendments.html', opt: 'amendments', title: 'Amendments' },
  meetings: { nav: 'meetings.html', opt: 'meetings', title: 'Meetings' },
  'team-schedule': { nav: 'team-schedule.html', title: 'Team Schedule' },
  organisation: { nav: 'organisation.html', title: 'Organisation' },
  'my-schedule': { nav: 'my-schedule.html', title: 'My Schedule' },
  'client-space': { nav: 'client-space.html', title: 'Client Space' },
  settings: { nav: 'settings.html', title: 'Settings' },
};
export const DEFAULT_ROUTE = 'dashboard';
