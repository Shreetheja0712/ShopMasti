import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Login from "../Auth/Login";
import { authFetch, isLoggedIn } from "../../utils/api";
import "./Orders.css";

const STATUS_COLORS = {
  pending:   { bg: "#fef3c7", color: "#b45309" },
  shipped:   { bg: "#fefce8", color: "#ca8a04" },
  delivered: { bg: "#dcfce7", color: "#16a34a" },
  cancelled: { bg: "#fee2e2", color: "#dc2626" },
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) { setLoginOpen(true); setLoading(false); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/orders");
      const data = await res.json();
      if (res.ok) setOrders(data);
      else setError(data.error || "Failed to load orders.");
    } catch { setError("Unable to connect."); }
    finally { setLoading(false); }
  };

  const statusStyle = (status) =>
    STATUS_COLORS[status?.toLowerCase()] || { bg: "#f3f4f6", color: "#374151" };

  return (
    <>
      <Navbar onOpenLogin={() => setLoginOpen(true)} />
      <div className="sm-page">
        <div className="orders-root">
          <h1 className="orders-title">📦 My Orders</h1>

          {loading ? (
            <div className="sm-state-center"><div className="sm-spinner" /><p>Loading orders...</p></div>
          ) : error ? (
            <div className="orders-error">{error}</div>
          ) : orders.length === 0 ? (
            <div className="sm-state-center">
              <p style={{ fontSize: 48 }}>📭</p>
              <p>No orders yet.</p>
              <button className="orders-browse-btn" onClick={() => navigate("/products")}>Start Shopping</button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const st = statusStyle(order.status);
                const expanded = expandedId === order.id;
                return (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header" onClick={() => setExpandedId(expanded ? null : order.id)}>
                      <div className="och-left">
                        <div className="och-id">Order #{order.id}</div>
                        <div className="och-date">
                          {new Date(order.order_date).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </div>
                        {order.event?.name && (
                          <span className="och-event">🎉 {order.event.name}</span>
                        )}
                      </div>
                      <div className="och-right">
                        <span className="och-status" style={{ background: st.bg, color: st.color }}>
                          {order.status}
                        </span>
                        <span className="och-total">₹{parseFloat(order.final_amount).toFixed(2)}</span>
                        <span className={`och-arrow ${expanded ? "up" : ""}`}>▼</span>
                      </div>
                    </div>

                    {expanded && (
                      <div className="order-card-body">
                        {/* Items */}
                        <div className="order-items">
                          {order.items?.map((item, i) => (
                            <div key={i} className="order-item-row">
                              <div className="oi-info">
                                <div className="oi-name">{item.variant?.item?.name}</div>
                                <div className="oi-meta">{item.variant?.color} · {item.variant?.size}</div>
                              </div>
                              <div className="oi-qty">× {item.quantity}</div>
                              <div className="oi-price">₹{parseFloat(item.sub_total).toFixed(2)}</div>
                            </div>
                          ))}
                        </div>

                        {/* Summary */}
                        <div className="order-summary-panel">
                          <div className="osp-row"><span>MRP</span><span>₹{parseFloat(order.order_total).toFixed(2)}</span></div>
                          {parseFloat(order.discount_amount) > 0 && (
                            <div className="osp-row disc"><span>Discount</span><span>−₹{parseFloat(order.discount_amount).toFixed(2)}</span></div>
                          )}
                          <div className="osp-divider" />
                          <div className="osp-total"><span>Final Amount</span><span>₹{parseFloat(order.final_amount).toFixed(2)}</span></div>
                          <div className="osp-meta">
                            <span>Payment: {order.payment_method}</span>
                            <span className={order.payment_status === "paid" ? "paid" : "unpaid"}>
                              {order.payment_status}
                            </span>
                          </div>
                          <div className="osp-address">
                            📍 {order.address?.house_no} {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </div>

      {loginOpen && (
        <div className="sm-overlay" onClick={() => setLoginOpen(false)}>
          <div className="sm-popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="sm-popup-close" onClick={() => setLoginOpen(false)}>×</button>
            <Login switchToRegister={() => {}} onSuccess={() => { setLoginOpen(false); fetchOrders(); }} />
          </div>
        </div>
      )}
    </>
  );
}
