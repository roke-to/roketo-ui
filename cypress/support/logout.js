import HomePage from './pages/HomePage';

export function logout() {
  const home = new HomePage();
  home.visit();
  home.checkPage();
  home.logout();
  home.checkPage();
}
