import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import toast, { Toaster } from 'react-hot-toast';

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isLoggedIn = user && user.role === "user";
  const isLoggedInAdmin = user && user.role === "admin";

  const isActive = (to) => pathname === to || pathname.startsWith(to + "/");

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out.");
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav
      className="nav"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
      }}
    >
      <div
        className="container"
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Brand + Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            to="/"
            className="brand"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 800,
              letterSpacing: ".3px",
              color: "#a78bfa",
              textDecoration: "none",
              fontSize: "1.5rem",
              textTransform: "uppercase",
            }}
            aria-label="CP Arena Home"
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #7c3aed, #22d3ee)",
                boxShadow: "0 6px 16px rgba(34,211,238,0.25)",
                display: "grid",
                placeItems: "center",
                color: "#05111b",
                fontWeight: 900,
              }}
            >
              ⚡
            </span>
            CODE SMASH
            {user?.role === "admin" && (
              <span style={{ color: "red", fontWeight: "bold", marginLeft: 8 }}>
                ADMIN
              </span>
            )}
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 6 }}>
            {isLoggedInAdmin && (
            <>
            <NavLink to="/admin/contests" active={isActive("/admin/contests")}>
              🏆 Contests
            </NavLink>
            <NavLink to="/admin/problems" active={isActive("/admin/problems")}>
              📘 Problems
            </NavLink>
            </>
            )}
            {!isLoggedInAdmin && (
            <>
            <NavLink to="/contests" active={isActive("/contests")}>
              🏆 Contests
            </NavLink>
            <NavLink to="/problems" active={isActive("/problems")}>
              📘 Problems
            </NavLink>
            </>
            )}
            {user && (
              <NavLink to="/submissions" active={isActive("/submissions")}>
                📤 Submissions
              </NavLink>
            )}

            {isLoggedIn && (
              <NavLink to="/profile" active={isActive("/profile")}>
                👤 Profile
              </NavLink>
            )}
            {isLoggedInAdmin && (
              <NavLink to="/admin/users" active={isActive("/admin/users")}>
                👥 Users
              </NavLink>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isLoggedIn && !isLoggedInAdmin && (
            <>
              <Link to="/login" className="btn glossy ghost">
                Login
              </Link>
              <Link to="/register" className="btn glossy primary">
                Get started
              </Link>
            </>
          )}

          {isLoggedIn && (
            <>
              <button onClick={handleLogout} className="btn glossy danger">
                Logout
              </button>
            </>
          )}

          {isLoggedInAdmin && (
            <>
              <button onClick={handleLogout} className="btn glossy danger">
                Logout
              </button>
              <Link to="/admin/dashboard" className="btn glossy primary">
                Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: active ? "#ffffffff" : "#c7d2fe",
        fontWeight: active ? 800 : 600,
        padding: "8px 10px",
        borderRadius: 12,
        border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
        background: active
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(0, 30, 94, 0.02))"
          : "transparent",
        transition: "all 0.5s ease",
      }}
    >
      {children}
    </Link>
  );
}

export default Navbar;