import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";


import AdminDashboard from "./sections/AdminDashboard";
import AdminEvents    from "./sections/AdminEvents";
import AdminProducts  from "./sections/AdminProducts";
import AdminCategories from "./sections/AdminCategories";
import AdminOrders    from "./sections/AdminOrders";
import AdminUsers     from "./sections/AdminUsers";

const NAV = [
  { key: "dashboard",  label: "Dashboard",  icon: "📊" },
  { key: "events",     label: "Events",     icon: "🎉" },
  { key: "products",   label: "Products",   icon: "📦" },
  { key: "categories", label: "Categories", icon: "🗂️" },
  { key: "orders",     label: "Orders",     icon: "🧾" },
  { key: "users",      label: "Users",      icon: "👥" },
];

const SECTIONS = {
  dashboard:  <AdminDashboard />,
  events:     <AdminEvents />,
  products:   <AdminProducts />,
  categories: <AdminCategories />,
  orders:     <AdminOrders />,
  users:      <AdminUsers />,
};

export default function AdminLayout() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState("dashboard");

  // Guard — only admins
  useEffect(() => {
    if (!isLoggedIn()) { navigate("/", { state: { openLogin: true } }); return; }
    if (!isAdmin())    { navigate("/"); }
  }, [user,isLoggedIn,isAdmin,navigate]);

  const handleLogout = () => { logout(); navigate("/"); };

  const sectionLabel = NAV.find(n => n.key === section)?.label || "";

  return (
    <div className="admin-shell">

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>Shop<span>Masti</span></h2>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-nav">
          {NAV.map(item => (
            <div
              key={item.key}
              className={`admin-nav-item ${section === item.key ? "active" : ""}`}
              onClick={() => setSection(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-back-btn" onClick={() => navigate("/")}>
            ← Back to Store
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">
        <div className="admin-topbar">
          <h1>{sectionLabel}</h1>
          <div className="admin-topbar-right">
            <span className="admin-user-badge">
              Logged in as <strong>{user?.username}</strong>
            </span>
            <button className="btn-ghost" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>

        <div className="admin-content">
          {SECTIONS[section]}
        </div>
      </div>

    </div>
  );
}
