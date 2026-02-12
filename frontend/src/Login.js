import React from "react";
import { useState } from "react";
import "./loginStyle.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handlesubmit=async (e)=>{
    e.preventDefault();
    try{
 const res= await fetch("http://localhost:3000/",{
      method:"POST",
      headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
 })
 const data=await res.json();
 if(res.ok){
 console.log("Login successful:", data);
 alert('login succesful');
 localStorage.setItem("token", data.token);
 } else{
 console.error("Login failed:", data);
  alert('login failed');
 }
    }
    catch(err){
      console.error("Login failed:", err);
    }
  }
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
          <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password</label>
          <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />

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
        <p className="signup-text">
          Don't have an account? 
          <span 
            id="signup-link"
            onClick={switchToRegister}
          >
            Sign Up
          </span>
        </p>
      </div>

    </div>
  );
}

export default Login;
