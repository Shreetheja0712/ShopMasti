import React, { useState, useEffect } from "react";
import { authFetch } from "../../../utils/api";

const EMPTY_FORM = {
  name: "", description: "", banner_image: "", is_active: true,
};
const EMPTY_DISC = {
  min_purchase_amount: "", discount_amount: "", is_active: true,
};

export default function AdminEvents() {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState(null); // null | "add" | "edit" | "discount"
  const [form, setForm]           = useState(EMPTY_FORM);
  const [discForm, setDiscForm]   = useState(EMPTY_DISC);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [discEventId, setDiscEventId] = useState(null);
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/admin/events");
      const d = await res.json();
      if (res.ok) setEvents(d);
      else setError(d.error || "Failed to load events.");
    } catch { setError("Server error."); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal("add"); setError(""); };

  const openEdit = (ev) => {
    setForm({ name: ev.name, description: ev.description || "", banner_image: ev.banner_image || "", is_active: ev.is_active });
    setEditId(ev.id);
    setModal("edit");
    setError("");
  };

  const openDiscounts = async (ev) => {
    setDiscEventId(ev.id);
    setDiscForm(EMPTY_DISC);
    setModal("discount");
    try {
      const res = await authFetch(`/admin/events/${ev.id}/discounts`);
      const d = await res.json();
      if (res.ok) setDiscounts(d);
    } catch { }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await authFetch(
        editId ? `/admin/events/${editId}` : "/admin/events",
        { method: editId ? "PUT" : "POST", body: JSON.stringify(form) }
      );
      const d = await res.json();
      if (res.ok) { setModal(null); fetchEvents(); }
      else setError(d.error || "Failed to save.");
    } catch { setError("Server error."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const res = await authFetch(`/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) fetchEvents();
    } catch { }
  };

  const handleToggle = async (ev) => {
    try {
      await authFetch(`/admin/events/${ev.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...ev, is_active: !ev.is_active }),
      });
      fetchEvents();
    } catch { }
  };

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch(`/admin/events/${discEventId}/discounts`, {
        method: "POST",
        body: JSON.stringify({
          min_purchase_amount: parseFloat(discForm.min_purchase_amount),
          discount_amount: parseFloat(discForm.discount_amount),
          is_active: discForm.is_active,
        }),
      });
      if (res.ok) {
        const r = await authFetch(`/admin/events/${discEventId}/discounts`);
        const d = await r.json();
        if (r.ok) setDiscounts(d);
        setDiscForm(EMPTY_DISC);
      }
    } catch { }
    finally { setSaving(false); }
  };

  const handleDeleteDiscount = async (discId) => {
    try {
      await authFetch(`/admin/events/discounts/${discId}`, { method: "DELETE" });
      setDiscounts(prev => prev.filter(d => d.id !== discId));
    } catch { }
  };

  const filtered = events.filter(ev =>
    ev.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="admin-section-header">
        <h2>All Events ({events.length})</h2>
        <div className="admin-section-controls">
          <input className="admin-search" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-amber" onClick={openAdd}>+ Add Event</button>
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
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Discounts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="admin-empty">No events found.</div></td></tr>
              ) : filtered.map(ev => (
                <tr key={ev.id}>
                  <td>#{ev.id}</td>
                  <td style={{ fontWeight: 600, color: "#131921" }}>{ev.name}</td>
                  <td style={{ color: "#6b7280", maxWidth: 220 }}>{ev.description?.slice(0, 60) || "—"}{ev.description?.length > 60 ? "…" : ""}</td>
                  <td>
                    <span
                      className={`badge ${ev.is_active ? "badge-active" : "badge-inactive"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleToggle(ev)}
                      title="Click to toggle"
                    >
                      {ev.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button className="btn-ghost" onClick={() => openDiscounts(ev)}>
                      Discounts ({ev.discounts?.length || 0})
                    </button>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn-edit" onClick={() => openEdit(ev)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(ev.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{modal === "add" ? "Add New Event" : "Edit Event"}</h3>
              <button className="admin-modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              {error && <div className="admin-error">{error}</div>}
              <form className="admin-form" onSubmit={handleSave}>
                <div className="admin-field">
                  <label>Event Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Wedding" />
                </div>
                <div className="admin-field">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description..." />
                </div>
                <div className="admin-field">
                  <label>Banner Image URL</label>
                  <input value={form.banner_image} onChange={e => setForm({...form, banner_image: e.target.value})} placeholder="https://..." />
                </div>
                <label className="admin-toggle-field">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                  Active (visible to users)
                </label>
                <div className="admin-form-actions">
                  <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Event"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Discounts Modal */}
      {modal === "discount" && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Event Discounts</h3>
              <button className="admin-modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              {/* Existing discounts */}
              {discounts.length > 0 && (
                <div className="admin-table-wrap" style={{ marginBottom: 18 }}>
                  <table className="admin-table">
                    <thead><tr><th>Min Purchase (₹)</th><th>Discount (₹)</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {discounts.map(d => (
                        <tr key={d.id}>
                          <td>₹{parseFloat(d.min_purchase_amount).toLocaleString("en-IN")}</td>
                          <td>₹{parseFloat(d.discount_amount).toLocaleString("en-IN")}</td>
                          <td><span className={`badge ${d.is_active ? "badge-active" : "badge-inactive"}`}>{d.is_active ? "Active" : "Off"}</span></td>
                          <td><button className="btn-danger" onClick={() => handleDeleteDiscount(d.id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Add discount */}
              <form className="admin-form" onSubmit={handleAddDiscount}>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Add new discount rule:</p>
                <div className="admin-form-row">
                  <div className="admin-field">
                    <label>Min Purchase (₹)</label>
                    <input required type="number" min="0" value={discForm.min_purchase_amount}
                      onChange={e => setDiscForm({...discForm, min_purchase_amount: e.target.value})} placeholder="e.g. 5000" />
                  </div>
                  <div className="admin-field">
                    <label>Discount Amount (₹)</label>
                    <input required type="number" min="0" value={discForm.discount_amount}
                      onChange={e => setDiscForm({...discForm, discount_amount: e.target.value})} placeholder="e.g. 500" />
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Close</button>
                  <button type="submit" className="btn-amber" disabled={saving}>{saving ? "Adding..." : "+ Add Rule"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
