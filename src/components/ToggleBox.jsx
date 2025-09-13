import React from "react";

// Import Images
import loginImg from "../img/login.png";
import signupImg from "../img/signup.jpg";

const ToggleBox = () => {
  return (
    <div className="toggle-box before:bg-dark_blue">
      <div className="toggle-panel toggle-left">
        <h1
          className="italic text-camel text-5xl"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Đăng nhập
        </h1>
        <img
          src="https://static.vecteezy.com/system/resources/previews/019/199/710/original/bubble-milk-tea-pearl-milk-tea-png.png"
          alt="Login"
        />
      </div>
      <div className="toggle-panel toggle-right">
        <h1
          className="italic text-camel text-5xl"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Đăng ký
        </h1>
        <img
          src="https://i.pinimg.com/originals/21/ac/e2/21ace269e72ea052a568318d21cb0eee.png"
          alt="Signup"
          style={{ width: "80%" }}
        />
      </div>
    </div>
  );
};

export default ToggleBox;
