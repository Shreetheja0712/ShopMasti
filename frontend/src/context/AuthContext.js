import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { userId, username, email, role_id }
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Decode basic user info from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("username");
    const storedRoleId = localStorage.getItem("role_id");
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUser({
        userId: storedUserId,
        username: storedUsername || "",
        role_id: storedRoleId ? Number(storedRoleId) : 1,
      });
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("username", data.username || "");
    localStorage.setItem("role_id", data.role_id || 1);
    setToken(data.token);
    setUser({
      userId: data.userId,
      username: data.username || "",
      role_id: data.role_id || 1,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role_id");
    setToken(null);
    setUser(null);
  };

  const isLoggedIn = () => !!token;
  const isAdmin = () => user?.role_id === 2;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
