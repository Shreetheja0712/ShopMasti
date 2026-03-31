//event page
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Login from "../Auth/Login";
import Register from "../Auth/Register";
import { apiFetch } from "../../utils/api";
import "./Events.css";

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    apiFetch("/events")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setEvents(d.filter((e) => e.is_active)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getMaxDiscount = (event) => {
    if (!event.discounts?.length) return null;
    const best = event.discounts
      .filter((d) => d.is_active)
      .reduce((b, d) => parseFloat(d.discount_amount) > parseFloat(b.discount_amount) ? d : b, event.discounts[0]);
    return best ? { amount: parseFloat(best.discount_amount), minPurchase: parseFloat(best.min_purchase_amount) } : null;
  };

  return (
    <>
      <Navbar onOpenLogin={() => setLoginOpen(true)} onOpenRegister={() => setRegisterOpen(true)} />
      <div className="sm-page">
        <div className="events-root">
          <div className="events-hero">
            <h1>Shop by Life Event</h1>
            <p>Curated product packs for every major milestone — weddings, new homes, travel, and more.</p>
          </div>

          {loading ? (
            <div className="sm-state-center"><div className="sm-spinner" /><p>Loading events...</p></div>
          ) : events.length === 0 ? (
            <div className="sm-state-center"><p>No events available at the moment.</p></div>
          ) : (
            <div className="events-page-grid">
              {events.map((ev) => {
                const disc = getMaxDiscount(ev);
                return (
                  <div key={ev.id} className="event-page-card" onClick={() => navigate(`/events/${ev.id}`)}>
                    {ev.banner_image ? (
                      <img src={ev.banner_image} alt={ev.name} className="ep-card-img" />
                    ) : (
                      <div className="ep-card-placeholder">🎉</div>
                    )}
                    <div className="ep-card-body">
                      <h2>{ev.name}</h2>
                      {ev.description && <p className="ep-desc">{ev.description}</p>}
                      {disc && (
                        <div className="ep-discount-badge">
                          🏷️ Upto ₹{disc.amount} off on orders above ₹{disc.minPurchase}
                        </div>
                      )}
                      <button className="ep-shop-btn">Shop Now →</button>
                    </div>
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
            <Login switchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }} onSuccess={() => setLoginOpen(false)} />
          </div>
        </div>
      )}
      {registerOpen && (
        <div className="sm-overlay" onClick={() => setRegisterOpen(false)}>
          <div className="sm-popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="sm-popup-close" onClick={() => setRegisterOpen(false)}>×</button>
            <Register switchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }} />
          </div>
        </div>
      )}
    </>
  );
}
