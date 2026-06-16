import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer id="foot">
      <div className="logo-text">
        Shop<span>Masti</span>
      </div>
      <p>
        ShopMasti is an academic lab project developed to demonstrate the
        practical application of web development concepts learned during the
        course. The project simulates a basic online shopping platform and
        includes features such as product display, navigation, and a
        user-friendly interface designed using standard web technologies. The
        main objective of this project is to understand how real-world
        e-commerce websites are structured and function at a fundamental level.
        ShopMasti is created solely for educational purposes, without any
        commercial intent, and serves as a hands-on exercise to strengthen
        skills in frontend design and basic website functionality.
      </p>
      <div className="footer-links-container">
        <Link to="/developers" className="meet-devs-btn">
          <i className="fas fa-code"></i> Meet the Developers
        </Link>
      </div>
      <p id="last">© All copy rights are reserved.</p>
    </footer>
  );
}

export default Footer;
