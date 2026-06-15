import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { authFetch, isLoggedIn } from "../../utils/api";
import "./OrderConfirmation.css";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId, items, total } = location.state || {};

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=review, 4=done
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/", { state: { openLogin: true } }); return; }
    if (!items?.length) { navigate("/cart"); return; }
    fetchAddresses();
  }, [items?.length, navigate]);

  const fetchAddresses = async () => {
    try {
      const res = await authFetch("/addresses");
      const data = await res.json();
      if (res.ok) {
        setAddresses(data);
        const def = data.find((a) => a.is_default) || data[0];
        if (def) setSelectedAddress(def);
      }
    } catch { }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { setError("Please select a delivery address."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          event_id: eventId || null,
          address_id: selectedAddress.id,
          payment_method: paymentMethod,
          items: items?.map((i) => ({ variant_id: i.variant?.id || i.variant_id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (res.ok) { setOrderId(data.id || data.orderId); setStep(4); }
      else setError(data.error || "Failed to place order.");
    } catch { setError("Server error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Navbar onOpenLogin={() => navigate("/", { state: { openLogin: true } })} />
      <div className="sm-page">
        <div className="oc-root">
          {/* Step indicator */}
          <div className="oc-steps">
            {["Address", "Payment", "Review", "Done"].map((label, i) => (
              <React.Fragment key={i}>
                <div className={`oc-step ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}>
                  <div className="oc-step-dot">{step > i + 1 ? "✓" : i + 1}</div>
                  <span>{label}</span>
                </div>
                {i < 3 && <div className={`oc-step-line ${step > i + 1 ? "done" : ""}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1 — Address */}
          {step === 1 && (
            <div className="oc-section">
              <h2>Select Delivery Address</h2>
              {addresses.length === 0 ? (
                <div className="oc-no-address">
                  <p>No saved addresses. Please add one.</p>
                  <button onClick={() => navigate("/profile?tab=addresses")}>Add Address</button>
                </div>
              ) : (
                <div className="oc-address-grid">
                  {addresses.map((addr) => (
                    <div key={addr.id}
                      className={`oc-address-card ${selectedAddress?.id === addr.id ? "selected" : ""}`}
                      onClick={() => setSelectedAddress(addr)}>
                      <div className="oca-check">{selectedAddress?.id === addr.id ? "✓" : ""}</div>
                      <strong>{addr.full_name}</strong>
                      <p>{addr.house_no} {addr.street}, {addr.city}</p>
                      <p>{addr.state} - {addr.pincode}</p>
                      <p>{addr.mobile_number}</p>
                      {addr.is_default && <span className="oca-default">Default</span>}
                    </div>
                  ))}
                </div>
              )}
              <button className="oc-next-btn" onClick={() => setStep(2)} disabled={!selectedAddress}>
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <div className="oc-section">
              <h2>Payment Method</h2>
              <div className="oc-payment-options">
                {[
                  { value: "cod", label: "💵 Cash on Delivery", desc: "Pay when your order arrives" },
                  { value: "online", label: "💳 Online Payment", desc: "Simulated — no real transaction" },
                ].map((opt) => (
                  <div key={opt.value}
                    className={`oc-payment-card ${paymentMethod === opt.value ? "selected" : ""}`}
                    onClick={() => setPaymentMethod(opt.value)}>
                    <div className="oca-check">{paymentMethod === opt.value ? "✓" : ""}</div>
                    <div>
                      <strong>{opt.label}</strong>
                      <p>{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="oc-btn-row">
                <button className="oc-back-btn" onClick={() => setStep(1)}>← Back</button>
                <button className="oc-next-btn" onClick={() => setStep(3)}>Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="oc-section">
              <h2>Review Your Order</h2>
              <div className="oc-review-grid">
                <div className="oc-review-items">
                  <h4>Items</h4>
                  {items?.map((item, i) => (
                    <div key={i} className="oc-review-item">
                      <span>{item.variant?.item?.name} ({item.variant?.color}, {item.variant?.size})</span>
                      <span>× {item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="oc-review-summary">
                  <h4>Summary</h4>
                  <div className="oc-rs-row"><span>Total</span><span>₹{total?.toFixed(2)}</span></div>
                  <div className="oc-rs-row"><span>Payment</span><span>{paymentMethod === "cod" ? "Cash on Delivery" : "Online"}</span></div>
                  <div className="oc-rs-row"><span>Address</span><span>{selectedAddress?.city}, {selectedAddress?.state}</span></div>
                  {error && <div className="oc-error">{error}</div>}
                  <button className="oc-place-btn" onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? "Placing Order..." : "✅ Place Order"}
                  </button>
                </div>
              </div>
              <button className="oc-back-btn" onClick={() => setStep(2)}>← Back</button>
            </div>
          )}

          {/* Step 4 — Done */}
          {step === 4 && (
            <div className="oc-success">
              <div className="oc-success-icon">🎉</div>
              <h2>Order Placed!</h2>
              <p>Your order #{orderId} has been placed successfully.</p>
              <div className="oc-success-btns">
                <button onClick={() => navigate("/orders")}>View My Orders</button>
                <button className="outlined" onClick={() => navigate("/")}>Continue Shopping</button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
