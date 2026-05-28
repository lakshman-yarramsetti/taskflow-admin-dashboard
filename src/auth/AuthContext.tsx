import { useMemo, useState } from 'react';
import { login as loginRequest } from '../api/taskflow';
import type { User } from '../types/api';
import { AuthContext } from './auth-context';

function getSavedUser() {
  const savedUser = localStorage.getItem('taskflow_user');
  return savedUser ? (JSON.parse(savedUser) as User) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSavedUser());
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('taskflow_token'),
  );

  async function login(email: string, password: string) {
    const loginData = await loginRequest(email, password);
    localStorage.setItem('taskflow_token', loginData.accessToken);
    localStorage.setItem('taskflow_user', JSON.stringify(loginData.user));
    setToken(loginData.accessToken);
    setUser(loginData.user);
  }

  function logout() {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
