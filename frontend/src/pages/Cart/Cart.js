import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import { authFetch, isLoggedIn } from "../../utils/api";
import "./Cart.css";

// helpers 
function calcItemTotal(item) {
  const price = parseFloat(item.variant?.price || 0);
  const disc = parseFloat(item.variant?.item?.base_discount || 0);
  const final = disc ? price * (1 - disc / 100) : price;
  return {
    unitPrice: price,
    discountedUnit: final,
    total: final * item.quantity,
  };
}

function EventGroup({ group, onQtyChange, onRemove, onPlaceOrder }) {
  const [open, setOpen] = useState(true);

  // per-item totals
  const itemRows = group.items.map((item) => ({
    ...item,
    ...calcItemTotal(item),
  }));
  const mrp = itemRows.reduce((s, r) => s + r.unitPrice * r.quantity, 0);
  const productDiscount = itemRows.reduce(
    (s, r) => s + (r.unitPrice - r.discountedUnit) * r.quantity,
    0,
  );
  const afterProductDisc = mrp - productDiscount;

  // event discount
  const eventDisc =
    group.discounts
      ?.filter(
        (d) =>
          d.is_active && afterProductDisc >= parseFloat(d.min_purchase_amount),
      )
      ?.reduce((best, d) => Math.max(best, parseFloat(d.discount_amount)), 0) ||
    0;

  const final = afterProductDisc - eventDisc;

  return (
    <div className={`cart-group ${open ? "open" : ""}`}>
      {/* ── tile header ── */}
      <div className="cart-group-header" onClick={() => setOpen((v) => !v)}>
        <div className="cgh-left">
          <span className="cgh-icon">🎉</span>
          <div>
            <div className="cgh-name">{group.eventName || "General Cart"}</div>
            <div className="cgh-meta">
              {group.items.length} item{group.items.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <div className="cgh-right">
          {eventDisc > 0 && (
            <span className="cgh-event-disc">
              Event discount: −₹{eventDisc.toFixed(2)}
            </span>
          )}
          <span className="cgh-total">₹{final.toFixed(2)}</span>
          <span className={`cgh-arrow ${open ? "up" : ""}`}>▼</span>
        </div>
      </div>

      {/*expanded body  */}
      {open && (
        <div className="cart-group-body">
          {/* Items list (left) */}
          <div className="cg-items">
            {itemRows.map((row) => {
              const img =
                row.variant?.images?.find((i) => i.is_primary)?.image_url ||
                row.variant?.images?.[0]?.image_url;
              return (
                <div key={row.id} className="cg-item-row">
                  <div className="cg-item-img">
                    {img ? (
                      <img src={img} alt="" />
                    ) : (
                      <div className="cg-img-placeholder">📦</div>
                    )}
                  </div>
                  <div className="cg-item-info">
                    <div className="cg-item-name">
                      {row.variant?.item?.name}
                    </div>
                    <div className="cg-item-meta">
                      {row.variant?.color} · {row.variant?.size}
                    </div>
                    <div className="cg-item-price">
                      ₹{row.discountedUnit.toFixed(2)}
                      {row.unitPrice !== row.discountedUnit && (
                        <span className="cg-item-orig">
                          ₹{row.unitPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="cg-item-actions">
                    <div className="cg-qty">
                      <button
                        onClick={() =>
                          onQtyChange(row.id, row.quantity - 1, group.eventId)
                        }
                      >
                        −
                      </button>
                      <span>{row.quantity}</span>
                      <button
                        onClick={() =>
                          onQtyChange(row.id, row.quantity + 1, group.eventId)
                        }
                      >
                        +
                      </button>
                    </div>
                    <div className="cg-item-subtotal">
                      ₹{row.total.toFixed(2)}
                    </div>
                    <button
                      className="cg-remove"
                      onClick={() => onRemove(row.id, group.eventId)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary (right) */}
          <div className="cg-summary">
            <h4>Order Summary</h4>
            <div className="cg-sum-row">
              <span>MRP</span>
              <span>₹{mrp.toFixed(2)}</span>
            </div>
            {productDiscount > 0 && (
              <div className="cg-sum-row disc">
                <span>Product Discount</span>
                <span>−₹{productDiscount.toFixed(2)}</span>
              </div>
            )}
            {eventDisc > 0 && (
              <div className="cg-sum-row event-disc">
                <span>Event Discount</span>
                <span>−₹{eventDisc.toFixed(2)}</span>
              </div>
            )}
            <div className="cg-sum-divider" />
            <div className="cg-sum-total">
              <span>Total</span>
              <span>₹{final.toFixed(2)}</span>
            </div>
            {eventDisc === 0 && group.discounts?.length > 0 && (
              <div className="cg-disc-hint">
                Add ₹
                {(
                  parseFloat(group.discounts[0].min_purchase_amount) -
                  afterProductDisc
                ).toFixed(2)}{" "}
                more to unlock event discount!
              </div>
            )}
            <button
              className="cg-order-btn"
              onClick={() => onPlaceOrder(group.eventId, group.items, final)}
            >
              Place Order →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Cart 
export default function Cart() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]); // raw cart items from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/", { state: { openLogin: true } }); 
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/cart");
      const data = await res.json();
      if (res.ok) setCartData(data);
      else setError(data.error || "Failed to load cart.");
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = async (cartItemId, newQty, eventId) => {
    if (newQty < 1) {
      handleRemove(cartItemId, eventId);
      return;
    }
    try {
      await authFetch(`/cart/${cartItemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: newQty }),
      });
      fetchCart();
    } catch {}
  };

  const handleRemove = async (cartItemId, eventId) => {
    try {
      await authFetch(`/cart/${cartItemId}`, { method: "DELETE" });
      fetchCart();
    } catch {}
  };

  const handlePlaceOrder = (eventId, items, total) => {
    // Pass eventId and items via state to OrderConfirmation
    navigate("/order-confirmation", { state: { eventId, items, total } });
  };

  // Group cart items by event_id (null = general)
  const grouped = {};
  cartData.forEach((item) => {
    const key = item.event_id ?? "general";
    if (!grouped[key]) {
      grouped[key] = {
        eventId: item.event_id,
        eventName:
          item.event?.name ||
          (item.event_id ? `Event #${item.event_id}` : "General Cart"),
        discounts: item.event?.discounts || [],
        items: [],
      };
    }
    grouped[key].items.push(item);
  });

  const groups = Object.values(grouped);
  const grandTotal = groups.reduce((s, g) => {
    return s + g.items.reduce((ss, item) => ss + calcItemTotal(item).total, 0);
  }, 0);

  return (
    <>
      <Navbar/>

      <div className="sm-page">
        <div className="cart-root">
          <div className="cart-topbar">
            <h1 className="cart-title">🛒 My Cart</h1>
            {cartData.length > 0 && (
              <span className="cart-count">
                {cartData.length} item{cartData.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="sm-state-center">
              <div className="sm-spinner" />
              <p>Loading cart...</p>
            </div>
          ) : error ? (
            <div className="cart-error">{error}</div>
          ) : groups.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything yet.</p>
              <button onClick={() => navigate("/products")}>
                Browse Products
              </button>
              <button onClick={() => navigate("/events")} className="outlined">
                Shop by Event
              </button>
            </div>
          ) : (
            <div className="cart-scroll-area">
              {groups.map((group) => (
                <EventGroup
                  key={group.eventId ?? "general"}
                  group={group}
                  onQtyChange={handleQtyChange}
                  onRemove={handleRemove}
                  onPlaceOrder={handlePlaceOrder}
                />
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>

     
    </>
  );
}
