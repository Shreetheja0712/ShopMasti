import React from "react";
import "./registerStyle.css";

function Register() {
  return (
    <div className="register-container">
      
      <div className="register-left">
        <h2>
          Welcome to <span>ShopMasti</span>
        </h2>
        <p>The Largest Wholesale Marketplace.</p>
        <p className="small-text">
          One-stop wholesale business solution of imported products.
        </p>
      </div>

      <div className="register-right">
        <h3>Sign Up</h3>

        <form>
          
          <label>Username</label>
          <input type="text" placeholder="Enter Username" required />

          <label>Email</label>
          <input type="email" placeholder="Enter your email" required />

          <label>Password</label>
          <input type="password" placeholder="Enter password" required />

          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm password" required />

          <button type="submit" className="register-btn">
            Sign Up
          </button>
        </form>
        
       
      </div>

    </div>
  );
}

export default Register;
