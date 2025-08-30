import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ShowAdmins = ({ admins, loading }) => {
  const [list, setList] = useState([]);
  const [flagPending, setFlagPending] = useState(new Set());
  const [statusPending, setStatusPending] = useState(new Set());
  const [rolePending, setRolePending] = useState(new Set());

  useEffect(() => {
    setList(admins || []);
  }, [admins]);

  const handleToggleFlag = async (user) => {
    if (!user?._id) return;
    const id = user._id;
    const nextFlag = !Boolean(user.flag);

    setFlagPending(prev => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: nextFlag }),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      setList(prev => prev.map(u => (u._id === id ? { ...u, flag: nextFlag } : u)));
      alert(nextFlag ? "User flagged successfully" : "User unflagged successfully");
    } catch {
      alert("Error toggling flag");
    } finally {
      setFlagPending(prev => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const handleToggleDeactivate = async (user) => {
    if (!user?._id) return;
    const id = user._id;
    const isInactive = user.accountStatus === "inactive";
    const nextStatus = isInactive ? "active" : "inactive";

    setStatusPending(prev => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountStatus: nextStatus }),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      setList(prev => prev.map(u => (u._id === id ? { ...u, accountStatus: nextStatus } : u)));
      alert(nextStatus === "inactive" ? "User deactivated successfully" : "User activated successfully");
    } catch {
      alert("Error updating account status");
    } finally {
      setStatusPending(prev => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const handleChangeRole = async (user, newRole) => {
    if (!user?._id) return;
    if (!["admin", "user", "volunteer"].includes(newRole)) return;

    const id = user._id;
    const prevRole = user.role || "user";
    if (prevRole === newRole) return;

    setRolePending(prev => new Set(prev).add(id));
    setList(prev => prev.map(u => (u._id === id ? { ...u, role: newRole } : u)));

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      alert(`Role updated to ${newRole}`);
    } catch {
      // revert on failure
      setList(prev => prev.map(u => (u._id === id ? { ...u, role: prevRole } : u)));
      alert("Error updating role");
    } finally {
      setRolePending(prev => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  return (
    <>
          <div className="text-xl font-semibold mb-4">
            <Link to="/admin/users" className="btn tiny ghost">← All Users</Link><h2>Administrators</h2>
          </div>
            <div className="table">
              <div className="row users head">
                <div>#</div>
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Actions</div>
              </div>

              {(loading ? Array.from({ length: 8 }) : list).map((u, i) => {
                const isFlagged = !!u?.flag;
                const isInactive = u?.accountStatus === "inactive";
                const isFlagBusy = u?._id ? flagPending.has(u._id) : false;
                const isStatusBusy = u?._id ? statusPending.has(u._id) : false;
                const isRoleBusy = u?._id ? rolePending.has(u._id) : false;

                return (
                  <div
                    className={`row users ${loading ? "skeleton" : ""}`}
                    key={u?._id || i}
                    style={{ position: "relative", opacity: isInactive && !loading ? 0.85 : 1 }}
                  >
                    <div>{i + 1}</div>

                    <div className="user">
                      <div className="avatar users">
                        {u?.firstName?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span>{u?.name}</span>
                    </div>

                    <div>{u?.email}</div>

                    <div>
                      {!loading ? (
                        <div className="role-select-wrap">
                          <select
                            className="role-select"
                            value={u?.role || "user"}
                            onChange={(e) => handleChangeRole(u, e.target.value)}
                            disabled={isRoleBusy}
                            aria-busy={isRoleBusy}
                          >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                          </select>
                          {isRoleBusy && <span className="role-spinner">…</span>}
                        </div>
                      ) : (
                        <div className="pill">—</div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <button
                        onClick={() => u && handleToggleFlag(u)}
                        className="btn glossy ghost"
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        disabled={loading || isFlagBusy}
                        aria-busy={isFlagBusy}
                      >
                        {isFlagBusy ? "..." : isFlagged ? "Unflag" : "Flag"}
                      </button>

                      <button
                        onClick={() => u && handleToggleDeactivate(u)}
                        className="btn glossy primary"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                          background: !isInactive ? "#f87171" : undefined
                        }}
                        disabled={loading || isStatusBusy}
                        aria-busy={isStatusBusy}
                      >
                        {isStatusBusy ? "..." : isInactive ? "Activate" : "Deactivate"}
                      </button>
                    </div>

                    <div className="user-hover-info">
                      <p><strong>Username:</strong> {u?.username}</p>
                      <p><strong>Email:</strong> {u?.email}</p>
                      <p>
                        <strong>Date of Birth:</strong>{" "}
                        {u?.dateOfBirth
                          ? new Date(u.dateOfBirth).toLocaleDateString("en-UK", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

      <style>
        {`
          .user-hover-info {
            display: none;
            position: absolute;
            top: 0%;
            left: 20%;
            z-index: 50;
            max-width: 320px;
            width: max-content;
            padding: 16px 20px;
            color: #f8fafc;
            font-size: 0.85rem;
            line-height: 1.5;
            background: rgba(8, 10, 20, 0.94); /* darker glass tint */
            backdrop-filter: blur(24px) saturate(180%);
            -webkit-backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 14px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            transition: all 0.25s ease-in-out;
            pointer-events: none; /* prevents popup from blocking hover detection */
          }

          .row:hover .user-hover-info {
            display: block;
            pointer-events: auto;
            transform: translateY(6px);
          }
          .btn[disabled] { opacity: 0.6; cursor: not-allowed; }

          .role-select-wrap {
            position: relative;
            display: inline-flex;
            align-items: center;
          }
          .role-select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            padding: 8px 32px 8px 10px;
            border-radius: 999px;
            border: 1px solid var(--border);
            background: rgba(0, 5, 46, 0.08);
            color: var(--text);
            font-weight: 600;
            letter-spacing: .2px;
            box-shadow: var(--shadow);
            backdrop-filter: blur(8px);
          }
          .role-select-wrap::after {
            content: "▾";
            position: absolute;
            right: 10px;
            color: #002b38ff;
            pointer-events: none;
            font-size: 12px;
            opacity: 0.9;
          }
          .role-select:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
            .role-select option {
            background-color: #0d1829ff;
            color: #f8fafc;
            padding: 8px;
            font-weight: 500;
          }

          .role-select option:hover {
            background-color: #005f7c81;
          }
          .role-spinner {
            margin-left: 8px;
            color: #045778ff;
            font-weight: 800;
            opacity: 0.8;
          }
        `}
      </style>
    </>
  );

}

export default ShowAdmins;