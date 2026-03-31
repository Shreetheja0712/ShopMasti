import React, { useState, useEffect } from "react";
import { authFetch } from "../../../utils/api";

const EMPTY_FORM = {
  name: "", description: "", base_discount: "", subcategory_id: "", is_active: true,
};
const EMPTY_VARIANT = { color: "", size: "", price: "", stock: "" };

export default function AdminProducts() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("");
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [variants, setVariants]     = useState([{ ...EMPTY_VARIANT }]);
  const [editId, setEditId]         = useState(null);
  const [saving, setSaving]         = useState(false);
  const [page, setPage]             = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/admin/products");
      const d = await res.json();
      if (res.ok) setProducts(d);
      else setError(d.error || "Failed to load.");
    } catch { setError("Server error."); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await authFetch("/admin/categories");
      const d = await res.json();
      if (res.ok) setCategories(d);
    } catch { }
  };

  // All subcategories flat list
  const allSubcats = categories.flatMap(c => c.subcategories?.map(s => ({ ...s, catName: c.name })) || []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setVariants([{ ...EMPTY_VARIANT }]);
    setEditId(null);
    setModal("product");
    setError("");
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description || "",
      base_discount: p.base_discount || "", subcategory_id: p.subcategory_id || "", is_active: p.is_active,
    });
    setVariants(p.variants?.map(v => ({ color: v.color, size: v.size, price: v.price, stock: v.stock })) || [{ ...EMPTY_VARIANT }]);
    setEditId(p.id);
    setModal("product");
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        base_discount: form.base_discount ? parseFloat(form.base_discount) : null,
        subcategory_id: parseInt(form.subcategory_id),
        variants: variants.filter(v => v.color && v.size && v.price).map(v => ({
          color: v.color, size: v.size,
          price: parseFloat(v.price), stock: parseInt(v.stock) || 0,
        })),
      };
      const res = await authFetch(
        editId ? `/admin/products/${editId}` : "/admin/products",
        { method: editId ? "PUT" : "POST", body: JSON.stringify(payload) }
      );
      const d = await res.json();
      if (res.ok) { setModal(null); fetchProducts(); }
      else setError(d.error || "Failed to save.");
    } catch { setError("Server error."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This also removes all its variants.")) return;
    try {
      const res = await authFetch(`/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
    } catch { }
  };

  const handleToggle = async (p) => {
    try {
      await authFetch(`/admin/products/${p.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !p.is_active }),
      });
      fetchProducts();
    } catch { }
  };

  const addVariantRow = () => setVariants(v => [...v, { ...EMPTY_VARIANT }]);
  const removeVariantRow = (i) => setVariants(v => v.filter((_, idx) => idx !== i));
  const updateVariant = (i, field, val) => setVariants(v => v.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || String(p.subcategory?.category_id) === filterCat;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <div className="admin-section-header">
        <h2>Products ({products.length})</h2>
        <div className="admin-section-controls">
          <input className="admin-search" placeholder="Search products..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="admin-search" style={{ width: 160 }} value={filterCat}
            onChange={e => { setFilterCat(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn-amber" onClick={openAdd}>+ Add Product</button>
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
                <th>Subcategory</th>
                <th>Discount</th>
                <th>Variants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7}><div className="admin-empty">No products found.</div></td></tr>
              ) : paginated.map(p => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td style={{ fontWeight: 600, color: "#131921", maxWidth: 180 }}>{p.name}</td>
                  <td style={{ color: "#6b7280" }}>{p.subcategory?.name || "—"}</td>
                  <td>{p.base_discount ? `${p.base_discount}%` : "—"}</td>
                  <td>{p.variants?.length || 0} variants</td>
                  <td>
                    <span className={`badge ${p.is_active ? "badge-active" : "badge-inactive"}`}
                      style={{ cursor: "pointer" }} onClick={() => handleToggle(p)}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn-edit" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="admin-pagination">
              <span>Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</span>
              <div className="admin-pagination-btns">
                <button onClick={() => setPage(p => p-1)} disabled={page === 1}>← Prev</button>
                <button onClick={() => setPage(p => p+1)} disabled={page === totalPages}>Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal === "product" && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editId ? "Edit Product" : "Add New Product"}</h3>
              <button className="admin-modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              {error && <div className="admin-error">{error}</div>}
              <form className="admin-form" onSubmit={handleSave}>
                <div className="admin-field">
                  <label>Product Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Men's Casual Shirt" />
                </div>
                <div className="admin-field">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Product description..." />
                </div>
                <div className="admin-form-row">
                  <div className="admin-field">
                    <label>Subcategory</label>
                    <select required value={form.subcategory_id} onChange={e => setForm({...form, subcategory_id: e.target.value})}>
                      <option value="">Select subcategory...</option>
                      {allSubcats.map(s => <option key={s.id} value={s.id}>{s.catName} → {s.name}</option>)}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Base Discount (%)</label>
                    <input type="number" min="0" max="100" value={form.base_discount}
                      onChange={e => setForm({...form, base_discount: e.target.value})} placeholder="e.g. 10" />
                  </div>
                </div>
                <label className="admin-toggle-field">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                  Active (visible to customers)
                </label>

                {/* Variants */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280", display: "block", marginBottom: 8 }}>
                    Variants (Color / Size / Price / Stock)
                  </label>
                  {variants.map((v, i) => (
                    <div key={i} className="variant-row" style={{ marginBottom: 8 }}>
                      <div className="admin-field">
                        <label>Color</label>
                        <input value={v.color} onChange={e => updateVariant(i, "color", e.target.value)} placeholder="Red" />
                      </div>
                      <div className="admin-field">
                        <label>Size</label>
                        <input value={v.size} onChange={e => updateVariant(i, "size", e.target.value)} placeholder="M" />
                      </div>
                      <div className="admin-field">
                        <label>Price (₹)</label>
                        <input type="number" min="0" value={v.price} onChange={e => updateVariant(i, "price", e.target.value)} placeholder="999" />
                      </div>
                      <div className="admin-field">
                        <label>Stock</label>
                        <input type="number" min="0" value={v.stock} onChange={e => updateVariant(i, "stock", e.target.value)} placeholder="50" />
                      </div>
                      {variants.length > 1 && (
                        <button type="button" className="btn-danger" style={{ marginBottom: 0, alignSelf: "flex-end" }}
                          onClick={() => removeVariantRow(i)}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="variant-add-btn" onClick={addVariantRow}>
                    + Add another variant
                  </button>
                </div>

                <div className="admin-form-actions">
                  <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Product"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
