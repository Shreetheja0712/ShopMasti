import React, { useState } from "react";
import { apiFetch } from "../../utils/api";
import "./Auth.css";
import { customList } from "country-codes-list";

const COUNTRIES = Object.entries(
  customList("countryCode", "{countryNameEn}|{countryCallingCode}|{flag}")
)
  .map(([_, entry]) => {
    const [name, code, flag] = entry.split("|");
    return { name, code: `+${code}`, flag };
  })
  .filter((c) => c.code !== "+");

function Register({ switchToLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCountryChange = (e) => {
    const country = COUNTRIES[e.target.value];
    setSelectedCountry(country);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.phone
    ) {
      setError("Please fill in all fields");
      return;
    }

    // password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // strong password validation
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(
        formData.password
      )
    ) {
      setError(
        "Password must be at least 6 characters and include uppercase, lowercase, number, and special symbol"
      );
      return;
    }

    // phone validation
    if (!/^\d{7,15}$/.test(formData.phone)) {
      setError("Phone number must be 7-15 digits");
      return;
    }

    // gmail validation
    if (!/^[A-Z0-9._%+-]+@gmail\.com$/i.test(formData.email)) {
      setError("Only Gmail addresses are allowed");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        mobile_number: `${selectedCountry.code}${formData.phone}`,
        country: selectedCountry.name,
      };

      const res = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // 🔥 AUTO LOGIN
        localStorage.setItem("token", data.token);

        // redirect to home/dashboard
        window.location.href = "/";
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
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
            placeholder="Enter your gmail"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="auth-label">Phone Number</label>
          <div className="auth-phone-row">
            <select onChange={handleCountryChange} defaultValue={0}>
              {COUNTRIES.map((c, i) => (
                <option key={i} value={i}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>

            <input
              type="tel"
              placeholder="Phone number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <p>
            Country: <strong>{selectedCountry.name}</strong>
          </p>

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

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {switchToLogin && (
          <p>
            Already have an account?{" "}
            <span onClick={switchToLogin}>Log In</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Register;