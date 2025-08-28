// src/context/authContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
    const loadUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/auth/profile", { withCredentials: true });
      setUser(res.data);
    } catch {
      setUser(null); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(
        "/api/auth/login",
        { username, password },
        { withCredentials: true }
      );
      setUser(res.data.user);
      await loadUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const updateProfile = async (id, profileData) => {
    try {
      setLoading(true);
      const res = await axios.put(`/api/auth/profile/${id}`, profileData, {
        withCredentials: true,
      });
      setUser(res.data.user);
      await loadUser();
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};