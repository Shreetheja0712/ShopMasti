import React, { useState } from "react";
import "./registerStyle.css";

function Register() {
  const [formData,setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if(!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    

    try{
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registration successful! Please log in.");
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }

    }
    catch(err) {
      setError("Registration failed. Please try again.");
    }
  }  
  
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

        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}

        <form onSubmit={handleSubmit}>
          
          <label>Username</label>
          <input 
            type="text" 
            placeholder="Enter Username"  
            name = "username"
            value={formData.username}
            onChange={handleChange}
            required 
          />

          <label>Email</label>
          <input 
            type="email" 
            placeholder="Enter your email" 
            name = "email"
            value={formData.email}
            onChange={handleChange}
            required 
          />

          <label>Password</label>
          <input 
            type="password" 
            placeholder="Enter password" 
            name = "password"
            value={formData.password}
            onChange={handleChange}
            required 
          />

          <label>Confirm Password</label>
          <input 
            type="password" 
            placeholder="Confirm password" 
            name = "confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required 
          />

          <button type="submit" className="register-btn" >
            Sign Up
          </button>
        </form>
        
       
      </div>

    </div>
  );
}

export default Register;
