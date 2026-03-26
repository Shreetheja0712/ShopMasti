import {Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Cart from "./Cartt";
import MobileTablets from "./mobile_tablets";
function App() {
    return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/mobile-tablets" element={<MobileTablets />} />
            </Routes>
    );
}

export default App;
