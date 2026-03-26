import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./loginStyle.css";

function Login({ switchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);

        console.log("Login successful:", data);
        if (switchToRegister) {
          switchToRegister();
        } else {
          navigate("/");
        }
      } else {
        console.error("Login failed:", data);
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("An error occurred while logging in");
    } finally {
      setLoading(false);
    }
  };
  const handleSwitchToRegister = () => {
    if (switchToRegister) {
      switchToRegister();
    } else {
      navigate("/register");
    }
  };
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

        {error && <p className="error">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <label className="label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="label">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="options">
            <label className="label">
              <input type="checkbox" /> Remember me
            </label>
            <span className="forgot">Forgot Password?</span>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="signup-text" style={{ color: "#131921" }}>
          Don't have an account?
          <span id="signup-link" onClick={handleSwitchToRegister}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
