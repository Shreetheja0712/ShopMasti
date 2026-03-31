import React, { useState, useEffect } from "react";
import { authFetch } from "../../../utils/api";

export default function AdminCategories() {
  const [upperCats, setUpperCats]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcats, setSubcats]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [tab, setTab]               = useState("upper"); // "upper"|"category"|"subcat"
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState({});
  const [editId, setEditId]         = useState(null);
  const [saving, setSaving]         = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, c, s] = await Promise.all([
        authFetch("/admin/upper-categories").then(r => r.json()),
        authFetch("/admin/categories").then(r => r.json()),
        authFetch("/admin/subcategories").then(r => r.json()),
      ]);
      if (Array.isArray(u)) setUpperCats(u);
      if (Array.isArray(c)) setCategories(c);
      if (Array.isArray(s)) setSubcats(s);
    } catch { setError("Failed to load categories."); }
    finally { setLoading(false); }
  };

  const openAdd = (type) => {
    setForm(type === "subcat" ? { name: "", description: "", category_id: "", is_active: true }
           : type === "category" ? { name: "", description: "", upper_category_id: "", is_active: true }
           : { name: "", is_active: true });
    setEditId(null);
    setModal(type);
    setError("");
  };

  const openEdit = (type, item) => {
    setForm({ ...item });
    setEditId(item.id);
    setModal(type);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const paths = { upper: "/admin/upper-categories", category: "/admin/categories", subcat: "/admin/subcategories" };
    try {
      const res = await authFetch(
        editId ? `${paths[modal]}/${editId}` : paths[modal],
        { method: editId ? "PUT" : "POST", body: JSON.stringify(form) }
      );
      const d = await res.json();
      if (res.ok) { setModal(null); fetchAll(); }
      else setError(d.error || "Failed to save.");
    } catch { setError("Server error."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Delete this item?")) return;
    const paths = { upper: "/admin/upper-categories", category: "/admin/categories", subcat: "/admin/subcategories" };
    try {
      const res = await authFetch(`${paths[type]}/${id}`, { method: "DELETE" });
      if (res.ok) fetchAll();
    } catch { }
  };

  const tabStyle = (key) => ({
    padding: "8px 18px",
    background: tab === key ? "#131921" : "white",
    color: tab === key ? "white" : "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: tab === key ? 700 : 400,
    cursor: "pointer",
  });

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /><p>Loading...</p></div>;

  return (
    <>
      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button style={tabStyle("upper")}    onClick={() => setTab("upper")}>Upper Categories ({upperCats.length})</button>
        <button style={tabStyle("category")} onClick={() => setTab("category")}>Categories ({categories.length})</button>
        <button style={tabStyle("subcat")}   onClick={() => setTab("subcat")}>Subcategories ({subcats.length})</button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* Upper Categories */}
      {tab === "upper" && (
        <>
          <div className="admin-section-header">
            <h2>Upper Categories</h2>
            <button className="btn-amber" onClick={() => openAdd("upper")}>+ Add</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Categories</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {upperCats.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 600, color: "#131921" }}>{u.name}</td>
                    <td>{u.categories?.length || 0} categories</td>
                    <td><span className={`badge ${u.is_active ? "badge-active" : "badge-inactive"}`}>{u.is_active ? "Active" : "Inactive"}</span></td>
                    <td><div className="td-actions">
                      <button className="btn-edit" onClick={() => openEdit("upper", u)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete("upper", u.id)}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Categories */}
      {tab === "category" && (
        <>
          <div className="admin-section-header">
            <h2>Categories</h2>
            <button className="btn-amber" onClick={() => openAdd("category")}>+ Add</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Upper Category</th><th>Subcategories</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td style={{ fontWeight: 600, color: "#131921" }}>{c.name}</td>
                    <td>{c.upper_category?.name || "—"}</td>
                    <td>{c.subcategories?.length || 0}</td>
                    <td><span className={`badge ${c.is_active ? "badge-active" : "badge-inactive"}`}>{c.is_active ? "Active" : "Inactive"}</span></td>
                    <td><div className="td-actions">
                      <button className="btn-edit" onClick={() => openEdit("category", c)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete("category", c.id)}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Subcategories */}
      {tab === "subcat" && (
        <>
          <div className="admin-section-header">
            <h2>Subcategories</h2>
            <button className="btn-amber" onClick={() => openAdd("subcat")}>+ Add</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {subcats.map(s => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td style={{ fontWeight: 600, color: "#131921" }}>{s.name}</td>
                    <td>{s.category?.name || "—"}</td>
                    <td><span className={`badge ${s.is_active ? "badge-active" : "badge-inactive"}`}>{s.is_active ? "Active" : "Inactive"}</span></td>
                    <td><div className="td-actions">
                      <button className="btn-edit" onClick={() => openEdit("subcat", s)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete("subcat", s.id)}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editId ? "Edit" : "Add"} {modal === "upper" ? "Upper Category" : modal === "category" ? "Category" : "Subcategory"}</h3>
              <button className="admin-modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              {error && <div className="admin-error">{error}</div>}
              <form className="admin-form" onSubmit={handleSave}>
                <div className="admin-field">
                  <label>Name</label>
                  <input required value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                {modal === "category" && (
                  <>
                    <div className="admin-field">
                      <label>Upper Category</label>
                      <select value={form.upper_category_id || ""} onChange={e => setForm({...form, upper_category_id: e.target.value})}>
                        <option value="">None</option>
                        {upperCats.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div className="admin-field">
                      <label>Description</label>
                      <textarea value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} />
                    </div>
                  </>
                )}
                {modal === "subcat" && (
                  <>
                    <div className="admin-field">
                      <label>Parent Category</label>
                      <select required value={form.category_id || ""} onChange={e => setForm({...form, category_id: e.target.value})}>
                        <option value="">Select category...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="admin-field">
                      <label>Description</label>
                      <textarea value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} />
                    </div>
                  </>
                )}
                <label className="admin-toggle-field">
                  <input type="checkbox" checked={form.is_active ?? true} onChange={e => setForm({...form, is_active: e.target.checked})} />
                  Active
                </label>
                <div className="admin-form-actions">
                  <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
