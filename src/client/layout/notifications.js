// Notifications menu (header). Markup: layout/notifications.html.

export const notifications = () => ({
  notifOpen: false,
  get unread() { return this.notifications.filter((n) => n.unread).length; },
});
