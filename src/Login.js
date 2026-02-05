import React from "react";
import "./loginStyle.css";

function Login({ onClose }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic here
    };

    return (
        <div className="container">
            <div id="welcome">
                <p>
                    WELCOME to Shop Masti.
                    <br />
                    The Largest Wholesale
                    <br />
                    Marketplace.
                    <br />
                </p>
            </div>
            <div id="block">
                <h1 id="t1">Log in</h1>
                <hr id="line1" />
                <div id="form1">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            id="username"
                            placeholder="Username"
                            required
                        />
                        <br />
                        <br />
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            required
                        />
                        <br />
                        <br />
                        <p style={{ textAlign: "right" }}>
                            <a id="l1" href="">
                                Forgot Password?
                            </a>
                        </p>
                        <input type="submit" id="subButton" value="Log In" />
                    </form>
                    <p id="t2">
                        New User ?{" "}
                        <a id="l2" href="/register">
                            Register here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
