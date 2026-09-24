import { createContext, useContext, useState, useEffect } from "react";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getCurrentUser()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("access_token");
      })
      .finally(() => setLoading(false));
  }, []);

  // Store the JWT, then load the profile of the user it belongs to
  const startSession = async (accessToken) => {
    localStorage.setItem("access_token", accessToken);
    try {
      const meRes = await api.getCurrentUser();
      setUser(meRes.data);
    } catch (err) {
      localStorage.removeItem("access_token");
      throw err;
    }
  };

  const login = async (username, password) => {
    const res = await api.login(username, password);
    await startSession(res.data.access_token);
  };

  // Creates the account, then signs the new user in straight away
  const register = async (username, password) => {
    const res = await api.register(username, password);
    await startSession(res.data.access_token);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  const isAuthenticated = !!user || !!localStorage.getItem("access_token");

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
