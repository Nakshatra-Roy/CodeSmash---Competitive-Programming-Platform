import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (<div className="profile-page">
        <div className="backdrop">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="grid-overlay" />
        </div>
        <div className="container section">
          <div className="skeleton card glass">Loading page. Please wait...</div>
        </div>
      </div>
    );
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  return children;
};
