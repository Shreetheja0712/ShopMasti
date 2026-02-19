import React, { useState } from "react";
import "./Cartt.css";

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "EVENT 1", price: 100, qty: 1 },
    { id: 2, name: "EVENT 2", price: 250, qty: 1 },
    { id: 3, name: "EVENT 3", price: 380, qty: 1 },
  ]);

  function inc(id) {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  }

  function decr(id) {
    setCartItems(items =>
      items.map(item =>
        item.id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  }

  function del(id) {
    setCartItems(items => items.filter(item => item.id !== id));
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const discount = total * 0.10;
  const taxable = total - discount;
  const cgst = taxable * 0.09;
  const sgst = taxable * 0.09;
  const grandTotal = taxable + cgst + sgst;

  return (
    <>
      <h1 className="page-title">ShopMasti Cart</h1>

      <div className="cart-container">
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p style={{ textAlign: "center", fontWeight: "600" }}>
              Your cart is empty
            </p>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="cart-item">

                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="price">Price: ${item.price}</p>

                  <div className="qty-box">
                    <button onClick={() => decr(item.id)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => inc(item.id)}>+</button>
                  </div>
                </div>

                <div className="item-actions">
                  <p className="item-total">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                  <button
                    className="delete-btn"
                    onClick={() => del(item.id)}
                  >
                    Remove
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="order-summary">

          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>MRP</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="summary-row discount">
            <span>Discount (10%)</span>
            <span>- ${discount.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>CGST (9%)</span>
            <span>${cgst.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>SGST (9%)</span>
            <span>${sgst.toFixed(2)}</span>
          </div>

          <div className="divider"></div>

          <div className="summary-total">
            <span>Grand Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>

          <button
            className="checkout-btn"
            disabled={cartItems.length === 0}
          >
            Proceed to Checkout
          </button>

        </div>

      </div>
    </>
  );
}
