import React, { useState } from "react";
import { Link } from 'react-router-dom';
import "./home.css";
import Login from "./Login";
import Details from "./Details";
import Register from "./Register";
function Home() {
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const [registerPopupOpen, setRegisterPopupOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const openLogin = () => setLoginPopupOpen(true);
  const closeLogin = () => setLoginPopupOpen(false);
  const [show,showstate]=useState(false);
  const eve=()=>{showstate(true);
    console.log("Mouse overd on events");
  }
  const ever=()=>{
          showstate(false);
        };
  const openRegister = () => setRegisterPopupOpen(true);
  const closeRegister = () => setRegisterPopupOpen(false);
  const display = () => {
    setDetailsOpen(true);
  };
  const [details, setDetails] = useState(false);
  const toggleDetails = () => {
    setDetails(true);
  };
  const oggleDetails = () => {
    setDetails(false);
  };

  return (
    <>
      <div id="bar1">

<div
  id="ca" onMouseOver={toggleDetails} onMouseLeave={oggleDetails}
  style={{
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    marginLeft: "20px",
    marginTop: "10px",
    overflow: "hidden",
     flex: "0 0 auto",
  }}
>
  <img
    src="https://images.playground.com/62baa7f4ad824de3998899e7bd3ad7f7.jpeg"
    alt="User profile"
    style={{ width: "100%", height: "100%", objectFit: "cover" }}
  />
</div>
{details && <Details />}
        <div id="offer">
          <a href="#">Offers</a>
        </div>
        <div id="searchdiv">
          <input
            type="text"
            id="searchbox"
            placeholder="Search here for Products,Brands and More"
            style={{ color: "black" }}
          />
          <button
            id="search"
            type="submit"
            style={{ backgroundColor: "orange" }}
          >
            Search
          </button>
        </div>
        <div id="event" >
         <button id="even" onMouseOver={eve} onMouseLeave={ever} >EVENTS</button>
        </div>
        <div id="login">
          <button id="log" onClick={openLogin}>
            Login
          </button>
        </div>
        <div id="cart">
          <Link to="/cart">Cart</Link>
        </div>
      </div>
      <div id="bar2">
           
        <div id="all" style={{ paddingLeft: "30px" }}>
          <a href="#"> All</a>
        </div>
        <div id="mt">
          <a href="#">Mobiles & Tablets</a>
        </div>
        <div id="fashion">
          <a href="#">Fashion</a>
        </div>
        <div id="electronics">
          <a href="#">Electronics</a>
        </div>
        <div id="hk">
          <a href="#">Home & Kitchen</a>
        </div>
        <div id="bp">
          <a href="#">Beauty & PersonalCare</a>
        </div>
      </div>
      <div id="display">
        <button id="btt1">&lt;</button>
        <img id="imgslide" alt="imageshow" src="" />
        <button id="btt2">&gt;</button>
      </div>
      <div className="offers">
        <h1 id="of1">AMAZING DEALS</h1>
      </div>
      <div className="cl1">
        <div id="b1"></div>
        <div id="b2"></div>
        <div id="b3"></div>
      </div>
      <div className="cl2">
        <div id="b4"></div>
        <div id="b5"></div>
        <div id="b6"></div>
      </div>
      {loginPopupOpen && (
        <div className="popup-overlay" onClick={closeLogin}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closeLogin}>
              ×
            </button>

             <Login
              switchToRegister={() => {
                setLoginPopupOpen(false);
                setRegisterPopupOpen(true);
              }}
            />
          </div>
        </div>
      )}
       {registerPopupOpen && (
        <div className="popup-overlay" onClick={closeRegister}>
          <div
            className="popup-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="popup-close" onClick={closeRegister}>
              ×
            </button>

            <Register />
          </div>
        </div>
      )}

      {detailsOpen && (
        <div className="detail" style={{ display: "flex" }}>
          {/* Details component will be embedded here */}
        </div>
      )}
      {show && (
        <div className="eventlist" onMouseLeave={ever}>
            <ul id="listitems">
              <li>Lovers</li>
              <li>Marriage</li>
              <li>Breakup</li>
              <li>Birthdays</li>
            </ul>
        </div>
      )
      }
      <footer id="foot">
        <p>
          ShopMasti is an academic lab project developed to demonstrate the
          practical application of web development concepts learned during the
          course. The project simulates a basic online shopping platform and
          includes features such as product display, navigation, and a
          user-friendly interface designed using standard web technologies. The
          main objective of this project is to understand how real-world
          e-commerce websites are structured and function at a fundamental
          level. ShopMasti is created solely for educational purposes, without
          any commercial intent, and serves as a hands-on exercise to strengthen
          skills in frontend design and basic website functionality.
        </p>
        <p id="last">© All copy rights are reserved.</p>
      </footer>
    </>
  );
}

export default Home;
