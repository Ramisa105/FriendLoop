import { createContext, useState, useEffect, useContext } from "react";

import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================
  // LOAD USER WHEN APP STARTS
  // =========================================

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/users/me");

        setUser(res.data);
      } catch (err) {
        console.error("Failed to load user:", err);

        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // =========================================
  // LOGIN
  // =========================================

  const login = async (email, password) => {
    // First login and get token
    const res = await API.post("/auth/login", {
      email,
      password,
    });

    // Save token
    localStorage.setItem("token", res.data.token);

    // NOW get complete profile from database
    const userRes = await API.get("/users/me");

    setUser(userRes.data);

    return userRes.data;
  };

  // =========================================
  // REGISTER
  // =========================================

  const register = async (name, email, password) => {
    const res = await API.post("/auth/register", {
      name,
      email,
      password,
    });

    // Save token
    localStorage.setItem("token", res.data.token);

    // Get complete newly-created user
    const userRes = await API.get("/users/me");

    setUser(userRes.data);

    return res.data;
  };

  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {
    localStorage.removeItem("token");

    setUser(null);
  };

  // =========================================
  // UPDATE USER AFTER PROFILE CHANGES
  // =========================================

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
