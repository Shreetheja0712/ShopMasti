import React from 'react';
import "./Cartt.css";
import {useState} from 'react';
export default function Cart(){
  //For temporary sake i choose these
 const cartItemsData = [
  { id: 1, name: 'Product 1', price: 100 },
  { id: 2, name: 'Product 2', price: 250 },
  { id: 3, name: 'Product 3', price: 380 },
   { id: 1, name: 'Product 1', price: 100 },
  { id: 2, name: 'Product 2', price: 250 },
  { id: 3, name: 'Product 3', price: 380 },
];

  return (
   <>
    <h1>ShopMasti Cart</h1>
       <h3>Items in Cart: {cartItemsData.length}</h3>
   
   <div className='cart-items'>
    {cartItemsData.map(item => (
      <div key={item.id} className='cart-item'>
        <h4>{item.name}</h4>
        <p>Price: ${item.price}</p>
        <p>
          Quantity
            <Mybutton />
        </p>
        <button id='delete'>delete
        </button>
      </div>
    ))}
    </div>
    <div className='Order-summary'>
   <p>
    This is order summary
   </p>
    </div>
   </>
  );
}
function Mybutton(){
   const [cartItems, setCartItems] = useState(0);
 function inc(){
  setCartItems(cartItems+1);
 }
 function decr(){
  if(cartItems>0)
  setCartItems(cartItems-1);
 }
 return(
  <>
   <button id='dec' onClick={inc}>
     -
   </button>
   <button id='count'>
   {cartItems}
   </button>
      <button id='dec' onClick={decr}>
    +
   </button>
  </>
 );
}