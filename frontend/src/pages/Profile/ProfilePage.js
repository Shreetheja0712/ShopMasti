import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Login from "../Auth/Login";
import { authFetch, isLoggedIn } from "../../utils/api";
import "./Profile.css";

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState(searchParams.get("tab") || "details");

  const handleTabChange = (key) => {
    setTab(key);
    setSearchParams({ tab: key });
  };
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  // Password
  const [pwdForm, setPwdForm] = useState({ current: "", newPwd: "", confirm: "" });

  // New address form
  const [addrForm, setAddrForm] = useState({
    full_name: "", mobile_number: "", house_no: "", street: "",
    city: "", state: "", pincode: "", country: "India", address_type: "Home", is_default: false
  });
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { setLoginOpen(true); setLoading(false); return; }
    fetchProfile();
    fetchAddresses();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authFetch("/users/me");
      const data = await res.json();
      if (res.ok) setProfile(data);
    } catch { }
    finally { setLoading(false); }
  };

  const fetchAddresses = async () => {
    try {
      const res = await authFetch("/addresses");
      const data = await res.json();
      if (res.ok) setAddresses(data);
    } catch { }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify({ username: profile.username, mobile_number: profile.mobile_number, country: profile.country }),
      });
      if (res.ok) setMsg({ text: "Profile updated!", type: "success" });
      else setMsg({ text: "Failed to update.", type: "error" });
    } catch { setMsg({ text: "Server error.", type: "error" }); }
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (pwdForm.newPwd !== pwdForm.confirm) { setMsg({ text: "Passwords don't match.", type: "error" }); return; }
    try {
      const res = await authFetch("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({ current_password: pwdForm.current, new_password: pwdForm.newPwd }),
      });
      if (res.ok) { setMsg({ text: "Password updated!", type: "success" }); setPwdForm({ current: "", newPwd: "", confirm: "" }); }
      else setMsg({ text: "Incorrect current password.", type: "error" });
    } catch { setMsg({ text: "Server error.", type: "error" }); }
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch("/addresses", { method: "POST", body: JSON.stringify(addrForm) });
      if (res.ok) { fetchAddresses(); setShowAddrForm(false); setMsg({ text: "Address added!", type: "success" }); }
      else setMsg({ text: "Failed to add address.", type: "error" });
    } catch { setMsg({ text: "Server error.", type: "error" }); }
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await authFetch(`/addresses/${id}`, { method: "DELETE" });
      fetchAddresses();
    } catch { }
  };

  return (
    <>
      <Navbar onOpenLogin={() => setLoginOpen(true)} />
      <div className="sm-page">
        <div className="profile-root">
          <h1 className="profile-title">👤 My Profile</h1>

          {/* Tabs */}
          <div className="profile-tabs">
            {[
              { key: "details", label: "My Details" },
              { key: "addresses", label: "Saved Addresses" },
              { key: "password", label: "Reset Password" },
            ].map((t) => (
              <button key={t.key} className={`profile-tab ${tab === t.key ? "active" : ""}`}
                onClick={() => handleTabChange(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {msg.text && (
            <div className={`profile-msg ${msg.type}`}>{msg.text}</div>
          )}

          {loading ? (
            <div className="sm-state-center"><div className="sm-spinner" /></div>
          ) : (
            <>
              {/* ── Details tab ── */}
              {tab === "details" && profile && (
                <div className="profile-card">
                  <form onSubmit={handleProfileSave} className="profile-form">
                    <div className="pf-row">
                      <div className="pf-field">
                        <label>Username</label>
                        <input value={profile.username || ""}
                          onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
                      </div>
                      <div className="pf-field">
                        <label>Email</label>
                        <input value={profile.email || ""} disabled />
                      </div>
                    </div>
                    <div className="pf-row">
                      <div className="pf-field">
                        <label>Mobile Number</label>
                        <input value={profile.mobile_number || ""}
                          onChange={(e) => setProfile({ ...profile, mobile_number: e.target.value })} />
                      </div>
                      <div className="pf-field">
                        <label>Country</label>
                        <input value={profile.country || ""}
                          onChange={(e) => setProfile({ ...profile, country: e.target.value })} />
                      </div>
                    </div>
                    <button type="submit" className="profile-save-btn">Save Changes</button>
                  </form>
                </div>
              )}

              {/* ── Addresses tab ── */}
              {tab === "addresses" && (
                <div className="profile-card">
                  <div className="addresses-header">
                    <h3>Saved Addresses</h3>
                    <button className="addr-add-btn" onClick={() => setShowAddrForm((v) => !v)}>
                      {showAddrForm ? "Cancel" : "+ Add Address"}
                    </button>
                  </div>

                  {showAddrForm && (
                    <form className="addr-form" onSubmit={handleAddAddress}>
                      <div className="pf-row">
                        <div className="pf-field"><label>Full Name</label>
                          <input required value={addrForm.full_name} onChange={(e) => setAddrForm({ ...addrForm, full_name: e.target.value })} /></div>
                        <div className="pf-field"><label>Mobile</label>
                          <input required value={addrForm.mobile_number} onChange={(e) => setAddrForm({ ...addrForm, mobile_number: e.target.value })} /></div>
                      </div>
                      <div className="pf-row">
                        <div className="pf-field"><label>House No / Flat</label>
                          <input value={addrForm.house_no} onChange={(e) => setAddrForm({ ...addrForm, house_no: e.target.value })} /></div>
                        <div className="pf-field"><label>Street</label>
                          <input value={addrForm.street} onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} /></div>
                      </div>
                      <div className="pf-row">
                        <div className="pf-field"><label>City</label>
                          <input required value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} /></div>
                        <div className="pf-field"><label>State</label>
                          <input required value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} /></div>
                        <div className="pf-field"><label>Pincode</label>
                          <input required value={addrForm.pincode} onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })} /></div>
                      </div>
                      <div className="pf-row" style={{ alignItems: "center" }}>
                        <div className="pf-field"><label>Address Type</label>
                          <select value={addrForm.address_type} onChange={(e) => setAddrForm({ ...addrForm, address_type: e.target.value })}>
                            <option>Home</option><option>Work</option><option>Other</option>
                          </select></div>
                        <label className="pf-checkbox">
                          <input type="checkbox" checked={addrForm.is_default}
                            onChange={(e) => setAddrForm({ ...addrForm, is_default: e.target.checked })} />
                          Set as default
                        </label>
                      </div>
                      <button type="submit" className="profile-save-btn">Save Address</button>
                    </form>
                  )}

                  <div className="addresses-grid">
                    {addresses.length === 0 ? (
                      <p className="no-addr">No saved addresses yet.</p>
                    ) : addresses.map((addr) => (
                      <div key={addr.id} className="addr-card">
                        {addr.is_default && <span className="addr-default-badge">Default</span>}
                        <strong>{addr.full_name}</strong>
                        <p>{addr.house_no} {addr.street}</p>
                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p>{addr.mobile_number}</p>
                        <div className="addr-actions">
                          <span className="addr-type">{addr.address_type}</span>
                          <button className="addr-del" onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Password tab ── */}
              {tab === "password" && (
                <div className="profile-card">
                  <h3>Reset Password</h3>
                  <form onSubmit={handlePasswordReset} className="profile-form" style={{ maxWidth: 440 }}>
                    <div className="pf-field"><label>Current Password</label>
                      <input type="password" value={pwdForm.current}
                        onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} required /></div>
                    <div className="pf-field"><label>New Password</label>
                      <input type="password" value={pwdForm.newPwd}
                        onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })} required /></div>
                    <div className="pf-field"><label>Confirm New Password</label>
                      <input type="password" value={pwdForm.confirm}
                        onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} required /></div>
                    <button type="submit" className="profile-save-btn">Update Password</button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>

      {loginOpen && (
        <div className="sm-overlay" onClick={() => setLoginOpen(false)}>
          <div className="sm-popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="sm-popup-close" onClick={() => setLoginOpen(false)}>×</button>
            <Login switchToRegister={() => {}} onSuccess={() => { setLoginOpen(false); fetchProfile(); fetchAddresses(); }} />
          </div>
        </div>
      )}
    </>
  );
}
