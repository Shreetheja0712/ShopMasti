import React, { useState, useEffect } from "react";
import { authFetch } from "../../../utils/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      authFetch("/admin/stats").then(r => r.json()).catch(() => null),
      authFetch("/admin/orders?limit=5").then(r => r.json()).catch(() => []),
    ]).then(([s, orders]) => {
      setStats(s);
      if (Array.isArray(orders)) setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="admin-loading"><div className="admin-spinner" /><p>Loading...</p></div>
  );

  return (
    <>
      {/* Stat cards */}
      <div className="admin-stats">
        <div className="stat-card amber">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats?.totalOrders ?? "—"}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Revenue</div>
          <div className="stat-value">₹{stats?.totalRevenue ? Number(stats.totalRevenue).toLocaleString("en-IN") : "—"}</div>
          <div className="stat-sub">Final amount</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Products</div>
          <div className="stat-value">{stats?.totalProducts ?? "—"}</div>
          <div className="stat-sub">Active items</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-label">Users</div>
          <div className="stat-value">{stats?.totalUsers ?? "—"}</div>
          <div className="stat-sub">Registered</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Events</div>
          <div className="stat-value">{stats?.totalEvents ?? "—"}</div>
          <div className="stat-sub">Active events</div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="admin-section-header">
        <h2>Recent Orders</h2>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan={6}><div className="admin-empty">No orders yet.</div></td></tr>
            ) : recentOrders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.user?.username || "—"}</td>
                <td>₹{parseFloat(o.final_amount).toLocaleString("en-IN")}</td>
                <td><span className={`badge badge-${o.payment_status}`}>{o.payment_status}</span></td>
                <td><span className={`badge badge-${o.status?.toLowerCase()}`}>{o.status}</span></td>
                <td>{new Date(o.order_date).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
