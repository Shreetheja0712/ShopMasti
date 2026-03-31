import React, { useState, useEffect } from "react";
import { authFetch } from "../../../utils/api";

const STATUSES = ["placed", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId]     = useState(null);
  const [updatingId, setUpdatingId]     = useState(null);
  const [page, setPage]           = useState(1);
  const PER_PAGE = 20;

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/admin/orders");
      const d = await res.json();
      if (res.ok) setOrders(d);
      else setError(d.error || "Failed to load orders.");
    } catch { setError("Server error."); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await authFetch(`/admin/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch { }
    finally { setUpdatingId(null); }
  };

  const filtered = orders.filter(o => {
    const matchSearch =
      String(o.id).includes(search) ||
      o.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || o.status?.toLowerCase() === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const statusCount = (s) => orders.filter(o => o.status?.toLowerCase() === s).length;

  return (
    <>
      {/* Quick status filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {[{ label: "All", val: "" }, ...STATUSES.map(s => ({ label: `${s} (${statusCount(s)})`, val: s }))].map(opt => (
          <button key={opt.val}
            style={{
              padding: "6px 14px", borderRadius: 20, border: "1px solid #e5e7eb",
              background: filterStatus === opt.val ? "#131921" : "white",
              color: filterStatus === opt.val ? "white" : "#374151",
              fontSize: 12, fontWeight: filterStatus === opt.val ? 700 : 400, cursor: "pointer",
            }}
            onClick={() => { setFilterStatus(opt.val); setPage(1); }}
          >{opt.label}</button>
        ))}
      </div>

      <div className="admin-section-header">
        <h2>Orders ({filtered.length})</h2>
        <div className="admin-section-controls">
          <input className="admin-search" placeholder="Search by ID or customer..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><p>Loading orders...</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Event</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={9}><div className="admin-empty">No orders found.</div></td></tr>
              ) : paginated.map(o => (
                <React.Fragment key={o.id}>
                  <tr style={{ cursor: "pointer" }} onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                    <td style={{ fontWeight: 700, color: "#131921" }}>#{o.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#131921" }}>{o.user?.username || "—"}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{o.user?.email}</div>
                    </td>
                    <td>{o.event?.name ? <span className="badge badge-active">{o.event.name}</span> : <span style={{ color: "#9ca3af" }}>—</span>}</td>
                    <td>{o.items?.length || 0} items</td>
                    <td style={{ fontWeight: 700 }}>₹{parseFloat(o.final_amount).toLocaleString("en-IN")}</td>
                    <td><span className={`badge badge-${o.payment_status}`}>{o.payment_status}</span></td>
                    <td>
                      <select
                        value={o.status}
                        onChange={e => { e.stopPropagation(); handleStatusChange(o.id, e.target.value); }}
                        onClick={e => e.stopPropagation()}
                        disabled={updatingId === o.id}
                        style={{
                          padding: "4px 8px", borderRadius: 6, border: "1px solid #e5e7eb",
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                          background: o.status === "delivered" ? "#dcfce7"
                            : o.status === "shipped" ? "#fefce8"
                            : o.status === "cancelled" ? "#fee2e2"
                            : "#eff6ff",
                          color: o.status === "delivered" ? "#15803d"
                            : o.status === "shipped" ? "#ca8a04"
                            : o.status === "cancelled" ? "#dc2626"
                            : "#2563eb",
                        }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ color: "#6b7280", fontSize: 12 }}>
                      {new Date(o.order_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>{expandedId === o.id ? "▲ Hide" : "▼ Details"}</span>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expandedId === o.id && (
                    <tr>
                      <td colSpan={9} style={{ padding: 0, background: "#f9fafb" }}>
                        <div style={{ padding: "16px 20px", display: "flex", gap: 32, flexWrap: "wrap" }}>
                          {/* Items */}
                          <div style={{ flex: 2, minWidth: 280 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", marginBottom: 10 }}>
                              Order Items
                            </div>
                            {o.items?.map((item, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                                <div>
                                  <div style={{ fontWeight: 600, color: "#131921" }}>{item.variant?.item?.name}</div>
                                  <div style={{ color: "#9ca3af", fontSize: 11 }}>{item.variant?.color} · {item.variant?.size} · ×{item.quantity}</div>
                                </div>
                                <div style={{ fontWeight: 700, color: "#131921" }}>₹{parseFloat(item.sub_total).toLocaleString("en-IN")}</div>
                              </div>
                            ))}
                          </div>

                          {/* Summary + Address */}
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", marginBottom: 10 }}>
                              Summary
                            </div>
                            <div style={{ fontSize: 13, color: "#374151", display: "flex", flexDirection: "column", gap: 5 }}>
                              <div style={{ display: "flex", justifyContent: "space-between" }}><span>MRP</span><span>₹{parseFloat(o.order_total).toLocaleString("en-IN")}</span></div>
                              {parseFloat(o.discount_amount) > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}><span>Discount</span><span>−₹{parseFloat(o.discount_amount).toLocaleString("en-IN")}</span></div>
                              )}
                              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid #e5e7eb", paddingTop: 6, marginTop: 2 }}>
                                <span>Final</span><span>₹{parseFloat(o.final_amount).toLocaleString("en-IN")}</span>
                              </div>
                              <div style={{ color: "#6b7280", marginTop: 6 }}>Payment: {o.payment_method}</div>
                              {o.address && (
                                <div style={{ color: "#6b7280", marginTop: 6, fontSize: 12 }}>
                                  📍 {o.address.full_name}<br />
                                  {o.address.house_no} {o.address.street}, {o.address.city}<br />
                                  {o.address.state} - {o.address.pincode}<br />
                                  {o.address.mobile_number}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
    </>
  );
}
