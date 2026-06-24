import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Login from "../Auth/Login";
import Register from "../Auth/Register";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-open login if redirected here with openLogin flag (e.g. from Cart)
  const [loginOpen, setLoginOpen] = useState(
    location.state?.openLogin || false,
  );
  const [registerOpen, setRegisterOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      bgImage:
        "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=80",
      label: "Wedding Season Deals",
      sub: "Up to 40% off on bridal collections",
    },
    {
      bgImage:
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
      label: "New Home Essentials",
      sub: "Everything you need to set up your dream home",
    },
    {
      bgImage:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      label: "Relocation Bundles",
      sub: "Smart packs for your big move abroad",
    },
  ];

  // Auto-advance slider
  useEffect(() => {
    const t = setInterval(
      () => setSlideIndex((i) => (i + 1) % slides.length),
      3500,
    );
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    document.body.style.overflow = loginOpen || registerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loginOpen, registerOpen]);

  return (
    <>
      <Navbar
        onOpenLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
        onOpenRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />

      {/* Push content below fixed navbar using responsive design tokens */}
      <div className="sm-page" style={{ minHeight: "auto" }}>
        {/* ── Hero Slider ── */}
        <div
          id="display"
          style={{
            backgroundImage: `url(${slides[slideIndex].bgImage})`,
            height: "220px",
            position: "relative",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "background-image 0.6s ease-in-out",
          }}
        >
          <button
            id="btt1"
            onClick={() =>
              setSlideIndex((i) => (i - 1 + slides.length) % slides.length)
            }
          >
            &#8249;
          </button>
          <div className="hero-content">
            <h1>{slides[slideIndex].label}</h1>
            <p>{slides[slideIndex].sub}</p>
            <button className="hero-cta" onClick={() => navigate("/events")}>
              Shop by Event →
            </button>
          </div>
          <button
            id="btt2"
            onClick={() => setSlideIndex((i) => (i + 1) % slides.length)}
          >
            &#8250;
          </button>
          <div className="hero-dots">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`hero-dot ${i === slideIndex ? "active" : ""}`}
                onClick={() => setSlideIndex(i)}
              />
            ))}
          </div>
        </div>

        {/* ── Amazing Deals ── */}
        <div className="offers">
          <h1 id="of1">AMAZING DEALS</h1>
        </div>

        {/* ── Product placeholder grid 1 ── */}
        <div className="cl1">
          <div id="b1" className="home-banner" onClick={() => navigate("/products?upper=electronics")}>
            <img
              src="https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80"
              alt="TV Deals"
              width="300"
              height="200"
            />
            <span className="tooltip-text">TVs & Home Entertainment</span>
          </div>
          <div id="b2" className="home-banner" onClick={() => navigate("/products?upper=home")}>
            <img
              src="https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=800&q=80"
              alt="Home Essentials"
              width="300"
              height="400"
            />
            <span className="tooltip-text">Home Essentials</span>
          </div>
          <div id="b3" className="home-banner" onClick={() => navigate("/products?upper=beauty")}>
            <img
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9"
              alt="Beauty Products"
              width="300"
              height="200"
              
            />
            <span className="tooltip-text">Beauty Products</span>
          </div>
        </div>

        {/* ── Trending Now ── */}
        <div className="offers1" style={{ marginTop: 0 }}>
          <h1 id="of1">TRENDING NOW</h1>
        </div>

        {/* ── Product placeholder grid 2 ── */}
        <div className="cl2">
          <div id="b4" className="home-banner" onClick={() => navigate("/products?upper=electronics")}>
            <img
              src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab"
              alt="Apple iPhone"
              width="300"
              height="400"
            
            ></img>
            <span className="tooltip-text">Apple iPhone</span>

          </div>
          <div id="b5" className="home-banner" onClick={() => navigate("/products?upper=fashion")}>
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d"
              alt="Fashion"
              width="300"
              height="400"
            />
            <span className="tooltip-text">Fashion</span>
          </div>
          <div id="b6" className="home-banner" onClick={() => navigate("/products?upper=home")}>
            <img
              src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f"
              alt="Kitchen Appliances"
              width="300"
              height="400"
            />
            <span className="tooltip-text">Kitchen Appliances</span>

          </div>
        </div>

        <Footer />
      </div>

      {/* ── Login popup ── */}
      {loginOpen && (
        <div className="popup-overlay" onClick={() => setLoginOpen(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setLoginOpen(false)}>
              ×
            </button>
            <Login
              switchToRegister={() => {
                setLoginOpen(false);
                setRegisterOpen(true);
              }}
              onSuccess={() => setLoginOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Register popup ── */}
      {registerOpen && (
        <div className="popup-overlay" onClick={() => setRegisterOpen(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="popup-close"
              onClick={() => setRegisterOpen(false)}
            >
              ×
            </button>
            <Register
              switchToLogin={() => {
                setRegisterOpen(false);
                setLoginOpen(true);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
