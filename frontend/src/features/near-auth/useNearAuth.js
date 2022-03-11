import { useRoketoContext } from 'app/roketo-context';

export function useNearAuth() {
  const { auth } = useRoketoContext();

  async function login(e) {
    if (e) {
      e.preventDefault();
    }

    await auth.login();
    return false;
  }

  async function logout() {
    await auth.logout();
  }

  return {
    accountId: auth.accountId,
    signedIn: auth.signedIn,
    login,
    logout,
  };
}
