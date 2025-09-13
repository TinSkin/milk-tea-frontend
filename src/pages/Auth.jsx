import React, { useState } from "react";

// Import Components
import Header from "../components/Header";
import Register from "../components/RegisterForm/Register";
import Login from "../components/LoginForm/Login";
import ToggleBox from "../components/ToggleBox";
import FadeInOnScroll from "./../components/FadeInOnScroll";

function Auth() {
  // State to manage the Login form and Register form
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const handleRegisterClick = () => {
    setIsSignUpActive(true);
  };
  const handleLogInClick = () => {
    setIsSignUpActive(false);
  };

  return (
    <div className="bg-gradient-to-t from-camel to-logo_color min-h-[100vh]">
      <Header />

      <FadeInOnScroll direction="right" delay={0.3}>
        <div
          className="container-body flex items-center justify-center min-h-screen overflow-hidden"
          style={{ minHeight: "calc(100vh - 200px)" }}
        >
          <div
            className={`container-slider bg-white rounded-md relative overflow-hidden ${
              isSignUpActive ? "active" : ""
            }`}
          >
            {/* LOG IN FORM */}
            <Login handleRegisterClick={handleRegisterClick} />

            {/* REGISTER FORM */}
            <Register handleLogInClick={handleLogInClick} />

            {/* TOGGLE BOX */}
            <ToggleBox />
          </div>
        </div>
      </FadeInOnScroll>
    </div>
  );
}

export default Auth;
