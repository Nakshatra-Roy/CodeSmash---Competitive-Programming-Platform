import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserActivity from '../components/UserActivity'
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/authContext";
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe } from "react-icons/fa";
import axios from "axios";

export default function Profile() {
  const { user, loading, updateProfile, logout, loadUser } = useAuth();
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", newPass: "" });
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      loadUser().catch(() => navigate("/login"));
    }
  }, [user, loadUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const key = name.split(".")[1];
      setFormData({
        ...formData,
        socialLinks: {
          ...formData.socialLinks,
          [key]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData) return;
    setSaving(true);
    try {
      const success = await updateProfile(formData._id, formData);
      if (success) {
        toast.success("Profile updated successfully.");
        setEditing(false);
      } else {
        toast.error("Profile update failed.");
      }
    } catch (err) {
      toast.error("Profile update failed.");
    } finally {
      setSaving(false);
    }
    navigate("/profile");
  };

  const handleSaveDP = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.put(`/api/auth/${user._id}/avatar`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Avatar updated successfully.");
      setEditing(false);
      loadUser();
      navigate("/profile");
    } catch (err) {
      toast.error("Avatar update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Successfully logged out.");
    navigate("/login");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.current || !passwordData.newPass) {
      return toast.error("Please fill in both fields.");
    }
    try {
      const res = await axios.put(
        `/api/auth/profile/${user._id}`,
        { password: passwordData.newPass },
        { withCredentials: true }
      );
      if (res.data.user) {
        toast.success("Password updated successfully.");
        setChangingPassword(false);
        setPasswordData({ current: "", newPass: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Password update failed.");
    }
  };

  if (loading || !formData) {
    return (
      <div className="profile-page">
        <div className="backdrop">
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="grid-overlay" />
        </div>
        <div className="container section">
          <div className="skeleton card glass">Loading profile. Please wait...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="backdrop">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="grid-overlay" />
      </div>

      <div className="container section profile-wrapper">
        <aside className="card glass profile-aside animate-left">
          <div className="avatar-wrap">
            <img
                src={
                  previewUrl ||
                  formData.avatar ||
                  "https://i.postimg.cc/9XdrBtYQ/Profile-avatar-placeholder-large.png"
                }
                alt={formData.username}
                className="avatar"
              />

            <div className="flex gap-1 mt-2">
              <button
                type="button"
                className="btn glossy ghost"
                onClick={() => fileRef.current.click()}
              >
                Change Avatar
              </button>
            </div>
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleSaveDP}
            />
          </div>

          <br />
          <div className="identity">
            <h2 className="hero-title shine">@{formData.username}</h2>
            <p className="muted">{formData.name}</p>
            <p className="muted small">{user?.email}</p>
            {formData.bio && <p className="muted small">"{formData.bio}"</p>}
          </div>

          <div className="chips">
            <span
              className={`pill ${
                user?.accountStatus === "active" ? "green" : "red"
              }`}
            >
              {user?.accountStatus}
            </span>
            {user?.flag && <span className="pill red">⚠ Flagged</span>}
          </div>
          <br />
          <div className="stats">
            <div className="stat-card">🏆 Contests Hosted: {user?.contests?.length || 0}</div>
            <div className="stat-card">🏆 Contests Enrolled: {user?.contestEnroll?.length || 0}</div>
            <div className="stat-card">📚 Problems Written: {user?.problems?.length || 0}</div>
            <div className="stat-card">📄 Submissions: {user?.submissions?.length || 0}</div>
          </div>
          <br />

          {/* Social Links */}
          <div className="social-links">
            {formData.socialLinks?.github && (
              <a className = "btn tiny ghost" href={formData.socialLinks.github} target="_blank" rel="noreferrer">
                <FaGithub size={20} /> GitHub
              </a>
            )}
            {formData.socialLinks?.linkedin && (
              <a className = "btn tiny ghost" href={formData.socialLinks.linkedin} target="_blank" rel="noreferrer">
                <FaLinkedin size={20} /> LinkedIn
              </a>
            )}
            {formData.socialLinks?.twitter && (
              <a className = "btn tiny ghost" href={formData.socialLinks.twitter} target="_blank" rel="noreferrer">
                <FaTwitter size={20} /> Twitter
              </a>
            )}
            {formData.socialLinks?.website && (
              <a className = "btn tiny ghost" href={formData.socialLinks.website} target="_blank" rel="noreferrer">
                <FaGlobe size={20} /> Website
              </a>
            )}
          </div>
          <br/>
          <div className="aside-meta">
            <small>
              Member since{" "}
              {user?.createdAt
                ? new Date(user?.createdAt).toLocaleDateString()
                : ""}
            </small>
          </div>
          <br/>
          <div className="flex gap-4 mt-2">
                <button
                className="btn glossy primary"
                onClick={() => {
                  setEditing(!editing);
                  setChangingPassword(false);
                }}
              >
                {editing ? "Cancel" : "Edit Profile"}
              </button>
              <button
                className="btn glossy ghost"
                onClick={() => {
                  setChangingPassword(!changingPassword);
                  setEditing(false);
                }}
              >
                {changingPassword ? "Cancel" : "Change Password"}
              </button>
            </div>
          <div className="aside-actions">
            <button className="btn glossy danger" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </aside>

        {/* Historical Activity */}
        {!editing && !changingPassword && <UserActivity userId={user?._id} />}


        {/* Edit Profile Form */}
        {editing && (
          <form className="card glass profile-form animate-right" onSubmit={handleSave}>
            <h3 className="card-title">Edit your profile</h3>
            <br />
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="cardInput input-full"
              />
            </div>
            <br />
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth ? formData.dateOfBirth.slice(0, 10) : ""}
                onChange={handleChange}
                className="cardInput input-full"
              />
            </div>
            <br />
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                className="cardInput input-full"
              />
            </div>
            <br />
            <div className="form-group">
              <label>GitHub</label>
              <input
                name="socialLinks.github"
                value={formData.socialLinks?.github || ""}
                onChange={handleChange}
                className="cardInput input-full"
                placeholder="https://github.com/username"
              />
            </div>
            <br />
            <div className="form-group">
              <label>LinkedIn</label>
              <input
                name="socialLinks.linkedin"
                value={formData.socialLinks?.linkedin || ""}
                onChange={handleChange}
                className="cardInput input-full"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <br />
            <div className="form-group">
              <label>Twitter</label>
              <input
                name="socialLinks.twitter"
                value={formData.socialLinks?.twitter || ""}
                onChange={handleChange}
                className="cardInput input-full"
                placeholder="https://twitter.com/username"
              />
            </div>
            <br />
            <div className="form-group">
              <label>Website</label>
              <input
                name="socialLinks.website"
                value={formData.socialLinks?.website || ""}
                onChange={handleChange}
                className="cardInput input-full"
                placeholder="https://example.com"
              />
            </div>
            <br />
            <button type="submit" className="btn glossy primary" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}

        {/* Change Password Form */}
        {changingPassword && (
          <form
            className="card glass profile-form animate-right"
            onSubmit={handlePasswordChange}
          >
            <h3 className="card-title">Change Password</h3>
            <br />
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                className="cardInput input-full"
              />
            </div>
            <br />
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.newPass}
                onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
                className="cardInput input-full"
              />
            </div>
            <br />
            <button type="submit" className="btn glossy primary">
              Update Password
            </button>
          </form>
        )}
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    </div>
  );
}