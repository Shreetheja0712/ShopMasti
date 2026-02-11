import React from "react";
/// import "./registerStyle.css";

function Register() {
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
                <h1 id="t1">Create Account</h1>
                <div id="otherPlatforms">
                    <button id="googleBtn">
                        {" "}
                        <img
                            src="../assets/images/google.png"
                            id="googleImg"
                            alt="google"
                        />{" "}
                    </button>
                </div>
                <div id="form1">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            id="name"
                            placeholder="Name"
                            required
                        />
                        <br />
                        <br />
                        <input
                            type="text"
                            id="email"
                            placeholder="Email"
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
                        <input type="submit" id="subButton" value="Sign Up" />
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
