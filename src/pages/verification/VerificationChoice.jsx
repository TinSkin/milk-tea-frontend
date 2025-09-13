import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faMobileAlt,
  faArrowLeft,
  faShieldAlt,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

import { useAuthStore } from "../../store/authStore";

const VerificationChoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || user?.email || "";

  const {
    isAuthenticated,
    user,
    logout,
    resendVerificationOTP,
    resendVerificationEmail,
  } = useAuthStore();

  //! Handle OTP choice
  const handleOTPChoice = async () => {
    if (!email) {
      return navigate("/login", { replace: true });
    }
    if (!isAuthenticated) {
      return navigate("/login", { state: { next: "/verify-otp", email } });
    }
    await resendVerificationOTP(email);
    navigate("/verify-otp", { state: { email } });
  };

  //! Handle email link choice
  const handleEmailLinkChoice = async () => {
    if (!email) {
      return navigate("/login", { replace: true });
    }
    await resendVerificationEmail(email);
    const ts = Date.now();
    try {
      localStorage.setItem(`resend_ts:${email}`, String(ts));
    } catch {}
    navigate("/verify-email", { state: { email, resentAt: ts } });
  };


  //! Back to login page
  const backToLogin = async () => {
    try {
      if (isAuthenticated) await logout(); // clear cookie + reset store
    } finally {
      navigate("/login", { replace: true, state: { email } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br py-12 px-4 sm:px-6 lg:px-8 from-camel/20 to-dark_blue/20">
      <div className="max-w-lg w-full space-y-8 p-8 bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-camel/10 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon
              icon={faShieldAlt}
              className="h-8 w-8 text-camel"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Chọn cách xác thực
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            Chúng tôi cần xác thực email của bạn
          </p>
          <p className="text-sm font-medium text-blue-600 mb-6">{email}</p>
        </div>

        {/* Verification Options */}
        <div className="space-y-4">
          {/* OTP Option */}
          <button
            onClick={handleOTPChoice}
            className="w-full group p-6 border-2 border-gray-200 rounded-xl hover:border-camel hover:bg-camel/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-camel focus:ring-offset-2"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-camel/10 rounded-lg flex items-center justify-center group-hover:bg-camel/20 transition-colors">
                  <FontAwesomeIcon
                    icon={faMobileAlt}
                    className="h-6 w-6 text-camel"
                  />
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Nhập mã xác thực
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Nhập mã 6 số được gửi qua email
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faClock} className="h-3 w-3 mr-1" />
                    <span>Nhanh chóng</span>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faShieldAlt}
                      className="h-3 w-3 mr-1"
                    />
                    <span>Bảo mật cao</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-camel transition-colors"></div>
              </div>
            </div>
          </button>

          {/* Email Link Option */}
          <button
            onClick={handleEmailLinkChoice}
            className="w-full group p-6 border-2 border-gray-200 rounded-xl hover:border-camel hover:bg-camel/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-camel focus:ring-offset-2"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="h-6 w-6 text-blue-600"
                  />
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Click link trong email
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Mở email và click vào link xác thực
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="h-3 w-3 mr-1"
                    />
                    <span>Truyền thống</span>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faShieldAlt}
                      className="h-3 w-3 mr-1"
                    />
                    <span>Tin cậy</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-camel transition-colors"></div>
              </div>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FontAwesomeIcon
              icon={faShieldAlt}
              className="h-5 w-5 text-gray-400 mt-0.5"
            />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Tại sao cần xác thực email?</p>
              <p>
                Để bảo vệ tài khoản và đảm bảo bạn có thể nhận thông báo quan
                trọng.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={backToLogin}
            className="inline-flex items-center text-camel hover:text-camel/80 font-semibold"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationChoice;
