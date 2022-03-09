import { useNear } from '../near-connect/useNear';

export function useNearAuth() {
  const near = useNear();

  async function login(e) {
    if (e) {
      e.preventDefault();
    }

    await near.login();
    return false;
  }

  async function logout() {
    await near.logout();
  }

  return {
    accountId: near.auth.signedAccountId,
    signedIn: near.auth.signedIn,
    inited: near.inited,
    login,
    logout,
  };
}
