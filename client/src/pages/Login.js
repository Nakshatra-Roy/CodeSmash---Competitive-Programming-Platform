import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, user, error} = useAuth();
  
  useEffect(() => {
    if (user) {
      toast.success("Successfully logged in!");
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "64px 0" }}>
        <div className="container section" style={{ maxWidth: 480, margin: "0 auto" }}>
          <div className="card glass">
            <h2 className="card-title" style={{ textAlign: "center", marginBottom: 16 }}>
              Login to CodeSmash.
            </h2>

            <form onSubmit={handleLogin} className="grid" style={{ gap: 12 }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <input
                  type="text"
                  className="cardInput input-full"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <input
                  type="password"
                  className="cardInput input-full"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="card highlight" style={{ color: "#ef4444" }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn glossy primary">
                🚀 Login
              </button>

              <p className="hint" style={{ textAlign: "center" }}>
                Don’t have an account? <Link to="/register">Register Now</Link> and begin your journey!
              </p>
            </form>
          </div>
        </div>
      </div>
      <Toaster
          position="bottom-right"
          reverseOrder={false}
          />
    </div>
  );
};

export default Login;