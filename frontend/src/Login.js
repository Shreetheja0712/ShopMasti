import React from "react";
import "./loginStyle.css";

function Login() {
  return (
    <div className="login-container">
      
      <div className="login-left">
        <h2>
          Welcome to <span>ShopMasti</span>
        </h2>
        <p>The Largest Wholesale Marketplace.</p>
        <p className="small-text">
          One-stop wholesale business solution of imported products.
        </p>
      </div>

      <div className="login-right">
        <h3>Log In</h3>

        <form>
          <label>Email</label>
          <input type="email" placeholder="Enter your email" required />

          <label>Password</label>
          <input type="password" placeholder="Enter password" required />

          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <span className="forgot">Forgot Password?</span>
          </div>

          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>
      </div>

    </div>
  );
}

export default Login;
