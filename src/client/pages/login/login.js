// Sign-in page (layout without menu). Markup: login.html.
import moment from 'moment';

export default () => ({
  email: '',
  password: '',
  showPassword: false,
  remember: true,
  year: moment().format('YYYY'),

  // Visual only: Google already signs people in to the web app, so this just opens the app.
  enter() {
    this.go('dashboard.html');
  },
});
