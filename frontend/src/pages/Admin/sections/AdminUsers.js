import React, { useState, useEffect } from "react";
import { authFetch } from "../../../utils/api";

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/admin/users");
      const d = await res.json();
      if (res.ok) setUsers(d);
      else setError(d.error || "Failed to load users.");
    } catch { setError("Server error."); }
    finally { setLoading(false); }
  };

  const handleToggle = async (u) => {
    try {
      const res = await authFetch(`/admin/users/${u.id}/toggle`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !u.is_active }),
      });
      if (res.ok) setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x));
    } catch { }
  };

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="admin-section-header">
        <h2>Users ({users.length})</h2>
        <div className="admin-section-controls">
          <input className="admin-search" placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><p>Loading...</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="admin-empty">No users found.</div></td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 600, color: "#131921" }}>{u.username}</td>
                  <td style={{ color: "#6b7280" }}>{u.email}</td>
                  <td style={{ color: "#6b7280" }}>{u.mobile_number || "—"}</td>
                  <td>
                    <span className={`badge ${u.role_id === 1 ? "badge-placed" : "badge-inactive"}`}>
                      {u.role_id === 1 ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${u.is_active ? "badge-active" : "badge-inactive"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleToggle(u)}
                      title="Click to toggle"
                    >
                      {u.is_active ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td style={{ color: "#6b7280", fontSize: 12 }}>
                    {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <button
                      className={u.is_active ? "btn-danger" : "btn-edit"}
                      onClick={() => handleToggle(u)}
                    >
                      {u.is_active ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
