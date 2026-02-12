import React from 'react';
import "./Cartt.css";
import {useState} from 'react';
export default function Cart(){
  const [cartItems, setCartItems] = useState(0);
  //For temporary sake i choose these
 const cartItemsData = [
  { id: 1, name: 'Product 1', price: 100 },
  { id: 2, name: 'Product 2', price: 250 },
  { id: 3, name: 'Product 3', price: 380 },
];
  return (
   <>
    <h1>Shopping Cart</h1>
       <h3>Items in Cart: {cartItems}</h3>
   <div className='cart-container'>
   <div className='cart-items'>
    {cartItemsData.map(item => (
      <div key={item.id} className='cart-item'>
        <h4>{item.name}</h4>
        <p>Price: ${item.price}</p>
      </div>
    ))}
    </div>
    </div>
   </>
  );
}