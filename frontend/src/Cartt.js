import React, { useState } from "react";
import "./Cartt.css";
export default function Cart() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Product 1", price: 100, qty: 1 },
    { id: 2, name: "Product 2", price: 250, qty: 1 },
    { id: 3, name: "Product 3", price: 380, qty: 1 },
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

  return (
    <>
      <h1>ShopMasti Cart</h1>
      <h3>Items in Cart: {cartItems.length}</h3>

      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <h4>{item.name}</h4>
            <p>Price: ${item.price}</p>

            <p>
              Quantity
              <button onClick={() => decr(item.id)}> - </button>
              {item.qty}
              <button onClick={() => inc(item.id)}> + </button>
            </p>

            <button onClick={() => del(item.id)}>
              delete
            </button>
          </div>
        ))}
      </div>

      <div className="Order-summary">
        <h3>Order Summary</h3>
        <p>Total Price: ${total}</p>
      </div>
    </>
  );
}