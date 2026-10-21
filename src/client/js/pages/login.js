// Page « Connexion » (maquette : mocks/login.html)
import moment from 'moment';

export default () => ({
  email: '',
  password: '',
  showPassword: false,
  remember: true,
  year: moment().format('YYYY'),

  // Page purement visuelle : aucune vérification, on ouvre simplement l'application.
  enter() {
    this.go('dashboard.html');
  },
});
