import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    dateOfBirth: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post("/api/auth/register", formData);
      if (res.status === 201) {
        toast.success("Account created successfully!");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      {/* Background */}
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      {/* Content */}
      <div className="container section">
        <div className="register-wrapper">
          {/* Left side */}
          <div className="register-info">
            <h2 className="hero-title shine">Create Your CodeSmash Account</h2>
            <p className="hero-sub">
              Join our community of competitive programmers and start smashing bugs, not keyboards.
            </p>

            <div className="fact-card">💡 Fun fact: The first computer “bug” was an actual moth found in 1947.</div>
            <div className="fact-card">🚀 Did you know? Typing 40 wpm for 5 hours means ~12,000 keystrokes.</div>
          </div>

          {/* Right side */}
          <form className="card glass register-form" onSubmit={handleSubmit}>
            <h3 className="card-title">Your Path to Glory Begins</h3>

            {error && <div className="error-text">{error}</div>}

            {[
              { label: "Username", name: "username", type: "text", placeholder: "Pick a unique handle", hint: "Visible to other users" },
              { label: "Full Name", name: "name", type: "text", placeholder: "Your real name" },
              { label: "Email Address", name: "email", type: "email", placeholder: "you@example.com", hint: "We’ll never share your email" },
              { label: "Date of Birth", name: "dateOfBirth", type: "date", placeholder: "", hint: "We celebrate member birthdays 🎂" },
              { label: "Password", name: "password", type: "password", placeholder: "Choose a strong password", hint: "Include letters, numbers & symbols" },
            ].map((field, i) => (
              <div className="form-group" key={i}>
                <label htmlFor={field.name}>{field.label}</label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required
                  className="cardInput input-full"
                />
                {field.hint && <small className="field-hint">{field.hint}</small>}
              </div>
            ))}

            <button type="submit" className="btn glossy primary">🎯 Sign Up Now</button>

            <p className="hint">
              Already have an account? <Link to="/login" style={{ color: "#a78bfa" }}>Log in here</Link>
            </p>
          </form>
        </div>
      </div>
      <Toaster
                position="bottom-right"
                reverseOrder={false}
                />
    </div>
  );
};

export default Register;