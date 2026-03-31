import React, { useState } from "react";
import { apiFetch } from "../../utils/api";
import "./Auth.css";

function Register({ switchToLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registration successful! Please log in.");
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          if (switchToLogin) switchToLogin();
        }, 1500);
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h2>
          Join <span>ShopMasti</span>
        </h2>
        <p>Shop smarter with event-based bundles.</p>
        <p className="auth-small-text">
          Create your account to start shopping for every life event.
        </p>
      </div>
      <div className="auth-right">
        <h3>Sign Up</h3>
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}
        <form onSubmit={handleSubmit}>
          <label className="auth-label">Username</label>
          <input
            type="text"
            placeholder="Enter username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <label className="auth-label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label className="auth-label">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label className="auth-label">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        {switchToLogin && (
          <p className="auth-switch-text">
            Already have an account? <span onClick={switchToLogin}>Log In</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Register;
