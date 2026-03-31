import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Login from "../Auth/Login";
import Register from "../Auth/Register";
import "./EventViewer.css";

export default function EventViewer() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/events/${eventId}`)
      .then((r) => r.json())
      .then((d) => { if (d?.id) setEvent(d); else setError("Event not found."); })
      .catch(() => setError("Failed to load event."))
      .finally(() => setLoading(false));
  }, [eventId]);

  const getMaxDiscount = (ev) => {
    if (!ev?.discounts?.length) return null;
    const best = ev.discounts
      .filter((d) => d.is_active)
      .reduce((b, d) => parseFloat(d.discount_amount) > parseFloat(b.discount_amount) ? d : b, ev.discounts[0]);
    return best ? { amount: parseFloat(best.discount_amount), min: parseFloat(best.min_purchase_amount) } : null;
  };

  const handleSubcategoryClick = (subcatId) => {
    navigate(`/products?subcategory=${subcatId}&eventId=${eventId}`);
  };

  if (loading) return (
    <>
      <Navbar onOpenLogin={() => setLoginOpen(true)} />
      <div className="sm-page sm-state-center"><div className="sm-spinner" /><p>Loading event...</p></div>
    </>
  );

  if (error || !event) return (
    <>
      <Navbar onOpenLogin={() => setLoginOpen(true)} />
      <div className="sm-page sm-state-center">
        <p>{error || "Event not found."}</p>
        <button className="ev-btn-dark" onClick={() => navigate("/events")}>Back to Events</button>
      </div>
    </>
  );

  const disc = getMaxDiscount(event);

  return (
    <>
      <Navbar onOpenLogin={() => setLoginOpen(true)} onOpenRegister={() => setRegisterOpen(true)} />
      <div className="sm-page">
        <div className="ev-root">
          {/* Back */}
          <button className="ev-back" onClick={() => navigate("/events")}>← All Events</button>

          {/* Event banner */}
          <div className="ev-banner" style={event.banner_image ? { backgroundImage: `url(${event.banner_image})` } : {}}>
            <div className="ev-banner-overlay">
              <h1>{event.name}</h1>
              {event.description && <p>{event.description}</p>}
              {disc && (
                <div className="ev-banner-disc">
                  🏷️ Upto ₹{disc.amount} off on orders above ₹{disc.min}
                </div>
              )}
            </div>
          </div>

          {/* Subcategories */}
          <div className="ev-section-title">
            <h2>Browse by Category</h2>
            <p>Click a category to see all products for this event</p>
          </div>

          {event.subcategories?.length === 0 ? (
            <div className="sm-state-center"><p>No categories available for this event yet.</p></div>
          ) : (
            <div className="ev-subcat-grid">
              {event.subcategories?.map((sub) => (
                <div key={sub.id || sub.subcategory_id} className="ev-subcat-card"
                  onClick={() => handleSubcategoryClick(sub.id || sub.subcategory_id)}>
                  {sub.banner_image ? (
                    <img src={sub.banner_image} alt={sub.name} className="ev-subcat-img" />
                  ) : (
                    <div className="ev-subcat-placeholder">🛍️</div>
                  )}
                  <div className="ev-subcat-body">
                    <h3>{sub.name}</h3>
                    {sub.event_description && <p>{sub.event_description}</p>}
                    <span className="ev-subcat-link">View Products →</span>
                  </div>
                </div>
              ))}
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
