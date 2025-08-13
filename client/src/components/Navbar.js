// import React from "react";
// import { Link } from "react-router-dom";

// const Navbar = () => {
//   return (
//     <nav style={{
//       padding: "1rem",
//       backgroundColor: "#240053ff",
//       color: "#fff",
//       display: "flex",
//       justifyContent: "justify-between",
//       alignItems: "center"
//     }}>
//       <div>
//         <Link to="/" style={{ marginRight: "1rem", color: "white" }}>🏠</Link>
//         <Link to="/problems" style={{ marginRight: "1rem", color: "white" }}>📘 Problems</Link>
//         <Link to="/submissions" style={{ marginRight: "1rem", color: "white" }}>📤 Submissions</Link>
//         <Link to="/profile" style={{ color: "white" }}>👤</Link>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { pathname } = useLocation();
  const isActive = (to) => (pathname === to || pathname.startsWith(to + "/"));

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
              textDecoration: "none" ,
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
                background:
                  "linear-gradient(135deg, #7c3aed, #22d3ee)",
                boxShadow: "0 6px 16px rgba(34,211,238,0.25)",
                display: "grid",
                placeItems: "center",
                color: "#05111b",
                fontWeight: 900,
              }}
            >
              ⚡
            </span>
            CODE VERSE
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginLeft: 6,
            }}
          >
            <NavLink to="/contests" active={isActive("/contests")}>
              🏆 Contests
            </NavLink>
            <NavLink to="/problems" active={isActive("/problems")}>
              📘 Problems
            </NavLink>
            <NavLink to="/submissions" active={isActive("/submissions")}>
              📤 Submissions
            </NavLink>
            <NavLink to="/profile" active={isActive("/profile")}>
              👤 Profile
            </NavLink>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link to="/problems" className="btn glossy ghost">
            Explore
          </Link>
          <Link to="/profile" className="btn glossy primary">
            Get started
          </Link>
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
