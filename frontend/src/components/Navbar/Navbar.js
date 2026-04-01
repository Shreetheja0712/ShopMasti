import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";
import "./Navbar.css";

export default function Navbar({ onOpenLogin, onOpenRegister }) {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEventFlyout, setShowEventFlyout] = useState(false);
  const [events, setEvents] = useState([]);
  const [upperCategories, setUpperCategories] = useState([]);
  const [hoveredUpper, setHoveredUpper] = useState(null);
  const [cartMsg, setCartMsg] = useState(false);

  const userMenuRef = useRef(null);
  const cartRef = useRef(null);

  const UPPER_CATS = [
    "Fashion",
    "Electronics",
    "Home & Kitchen",
    "Beauty & Personal Care",
  ];

  useEffect(() => {
    // Fetch live events for flyout
    apiFetch("/events")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setEvents(d);
      })
      .catch(() => {});

    // Fetch upper categories → categories → subcategories for mega menu
    apiFetch("/upper-categories")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setUpperCategories(d);
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setShowUserMenu(false);
      if (cartRef.current && !cartRef.current.contains(e.target))
        setCartMsg(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim())
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  const closeTransientUi = () => {
    setShowUserMenu(false);
    setShowEventFlyout(false);
    setHoveredUpper(null);
    setCartMsg(false);
  };

  const handleOpenLogin = () => {
    closeTransientUi();
    if (onOpenLogin) onOpenLogin();
  };

  const handleCartClick = (e) => {
    if (!isLoggedIn()) {
      e.preventDefault();
      setCartMsg(true);
      setTimeout(() => setCartMsg(false), 4000);
    }
  };

  const getMaxDiscount = (ev) => {
    if (!ev.discounts?.length) return null;
    const max = Math.max(
      ...ev.discounts.map((d) => parseFloat(d.discount_amount)),
    );
    return max > 0 ? `Up to ₹${max} off` : null;
  };

  const getUpperData = (name) => upperCategories.find((u) => u.name === name);

  return (
    <div className="navbar-wrapper">
      {/* BAR 1  */}
      <div id="bar1">
        {/* Brand name */}
        <div id="name" onClick={() => navigate("/")}>
          Shop<span>Masti</span>
        </div>

        {/* Offers */}
        <div id="offer">
          <button onClick={() => navigate("/products")} className="offers-link">
              Offers
          </button>
        </div>

        {/* Search */}
        <div id="searchdiv">
          <form onSubmit={handleSearch} style={{ display: "flex" }}>
            <input
              type="text"
              id="searchbox"
              placeholder="Search here for Products, Brands and More"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              id="search"
              type="submit"
              style={{ backgroundColor: "orange" }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Events with live flyout */}
        <div
          id="event"
          onMouseEnter={() => setShowEventFlyout(true)}
          onMouseLeave={() => setShowEventFlyout(false)}
        >
          <button id="even" onClick={() => navigate("/events")}>
            EVENTS
          </button>

          {showEventFlyout && (
            <div
              className="eventlist"
              onMouseEnter={() => setShowEventFlyout(true)}
            >
              <ul id="listitems">
                {events
                  .filter((e) => e.is_active)
                  .slice(0, 8)
                  .map((ev) => (
                    <li
                      key={ev.id}
                      onClick={() => {
                        setShowEventFlyout(false);
                        navigate(`/events/${ev.id}`);
                      }}
                    >
                      <span>{ev.name}</span>
                      {getMaxDiscount(ev) && (
                        <span className="ev-disc-tag">
                          {getMaxDiscount(ev)}
                        </span>
                      )}
                    </li>
                  ))}
                <li
                  className="ev-view-all"
                  onClick={() => {
                    setShowEventFlyout(false);
                    navigate("/events");
                  }}
                >
                  View All Events →
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Cart — blocks if not logged in */}
        <div id="cart" ref={cartRef}>
          <Link to="/cart" onClick={handleCartClick}>
            Cart
          </Link>

          {cartMsg && (
            <div className="cart-login-tooltip">
              <p>Login to use cart</p>
              <button
                onClick={() => {
                  setCartMsg(false);
                  handleOpenLogin();
                }}
              >
                Login
              </button>
            </div>
          )}
        </div>

        {/* Auth — Login OR user avatar+dropdown */}
        <div id="login" ref={userMenuRef}>
          {isLoggedIn() && user ? (
            <div className="user-area">
              <div
                className="user-avatar"
                onClick={() => setShowUserMenu((v) => !v)}
                title={user.username}
              >
                {(user.username?.[0] || "U").toUpperCase()}
              </div>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <strong>{user.username}</strong>
                    <span>My Account</span>
                  </div>
                  <ul>
                    <li
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/profile");
                      }}
                    >
                      👤 My Profile
                    </li>
                    <li
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/orders");
                      }}
                    >
                      📦 My Orders
                    </li>
                    <li
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/profile?tab=addresses");
                      }}
                    >
                      📍 Saved Addresses
                    </li>
                    <li
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/profile?tab=password");
                      }}
                    >
                      🔒 Reset Password
                    </li>
                    {user.role_id === 1 && (
                      <li
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/admin");
                        }}
                      >
                        ⚙️ Admin Panel
                      </li>
                    )}
                    <li className="signout" onClick={handleLogout}>
                      🚪 Sign Out
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <button id="log" onClick={handleOpenLogin}>
              Login
            </button>
          )}
        </div>
      </div>

      {/* BAR 2  */}
      <div id="bar2">
        {/* All — no mega menu */}
        <div id="all">
          <span onClick={() => navigate("/products")}>All</span>
        </div>

        {/* Each upper category */}
        {UPPER_CATS.map((name) => (
          <div
            key={name}
            className="bar2-item"
            onMouseEnter={() => setHoveredUpper(name)}
            onMouseLeave={() => setHoveredUpper(null)}
          >
            <span
              className={`bar2-link ${hoveredUpper === name ? "bar2-active" : ""}`}
              onClick={() =>
                navigate(`/products?upper=${encodeURIComponent(name)}`)
              }
            >
              {name}
            </span>

            {/* ── Mega menu ── */}
            {hoveredUpper === name && (
              <div
                className="mega-menu"
                onMouseEnter={() => setHoveredUpper(name)}
                onMouseLeave={() => setHoveredUpper(null)}
              >
                {(() => {
                  const data = getUpperData(name);
                  if (!data?.categories?.length)
                    return <p className="mega-empty">No categories found</p>;

                  return data.categories
                    .filter((c) => c.is_active)
                    .map((cat) => (
                      <div key={cat.id} className="mega-col">
                        {/* Bold category header */}
                        <div
                          className="mega-cat-title"
                          onClick={() => {
                            setHoveredUpper(null);
                            navigate(`/products?category=${cat.id}`);
                          }}
                        >
                          {cat.name}
                        </div>

                        {/* Subcategory list links */}
                        <ul>
                          {cat.subcategories
                            ?.filter((s) => s.is_active)
                            .map((sub) => (
                              <li
                                key={sub.id}
                                onClick={() => {
                                  setHoveredUpper(null);
                                  navigate(`/products?subcategory=${sub.id}`);
                                }}
                              >
                                {sub.name}
                              </li>
                            ))}
                        </ul>
                      </div>
                    ));
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
