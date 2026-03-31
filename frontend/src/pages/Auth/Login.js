import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";
import "./Auth.css";

function Login({ switchToRegister, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        if (onSuccess) onSuccess();
        else navigate("/");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("An error occurred while logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h2>Welcome to <span>ShopMasti</span></h2>
        <p>Shop smarter with event-based bundles.</p>
        <p className="auth-small-text">
          One-stop shopping solution for every life event.
        </p>
      </div>
      <div className="auth-right">
        <h3>Log In</h3>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="auth-label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="auth-label">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="auth-options">
            <label className="auth-label">
              <input type="checkbox" /> Remember me
            </label>
            <span className="auth-forgot">Forgot Password?</span>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="auth-switch-text">
          Don't have an account?{" "}
          <span onClick={switchToRegister}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
