import React from "react";
import CustomWave from "./CustomWave";

const ToggleBox = ({ handleRegisterClick, handleLogInClick }) => {
  return (
    <div className="toggle-box before:bg-dark_blue" style={{ position: 'relative' }}>
      {/* CustomWave Background */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 20,
        overflow: 'hidden' 
      }}>
        <CustomWave 
          primaryColor="#F78DA7" 
          secondaryColor="#8ED1FC" 
          animationSpeed="4s"
        />
      </div>
      
      <div className="toggle-panel toggle-left" style={{ zIndex: 100 }}>
        <h1
          className="italic text-camel text-4xl lg:text-5xl mb-4"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Đăng nhập
        </h1>
        <p className="text-white text-center mb-6 px-4 text-sm lg:text-base leading-relaxed">
          Chào mừng bạn quay lại!
          <br />
          Nhập thông tin để truy cập tài khoản
        </p>
        <button
          type="button"
          onClick={handleRegisterClick}
          className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-dark_blue transition-all duration-300 font-semibold relative"
          style={{ zIndex: 200, pointerEvents: "auto" }}
        >
          Đăng nhập
        </button>
        <img
          src="https://static.vecteezy.com/system/resources/previews/019/199/710/original/bubble-milk-tea-pearl-milk-tea-png.png"
          alt="Login"
          className="mt-6 w-32 lg:w-48 object-contain"
        />
      </div>
      <div className="toggle-panel toggle-right" style={{ zIndex: 100 }}>
        <h1
          className="italic text-camel text-4xl lg:text-5xl mb-4"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Đăng ký
        </h1>
        <p className="text-white text-center mb-6 px-4 text-sm lg:text-base leading-relaxed">
          Tạo tài khoản mới để trải nghiệm
          <br />
          dịch vụ tuyệt vời của chúng tôi
        </p>
        <button
          type="button"
          onClick={handleLogInClick}
          className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-dark_blue transition-all duration-300 font-semibold relative"
          style={{ zIndex: 200, pointerEvents: "auto" }}
        >
          Đăng ký
        </button>
        <img
          src="https://i.pinimg.com/originals/21/ac/e2/21ace269e72ea052a568318d21cb0eee.png"
          alt="Signup"
          className="mt-6 w-32 lg:w-48 object-contain"
          style={{ maxWidth: "80%" }}
        />
      </div>
    </div>
  );
};

export default ToggleBox;
