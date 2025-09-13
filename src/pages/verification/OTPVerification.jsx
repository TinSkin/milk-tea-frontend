import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// Import store for managing state
import { useAuthStore } from "../../store/authStore";

const OTPVerification = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  //! Extracted from auth store for email verification
  const { isLoading, verifyOTP, resendVerificationOTP, logout } =
    useAuthStore();

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  //! Initialize code from URL state if available
  const handleChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  //! Handle backspace to focus previous input
  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  //! Handle code submission
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      if (e?.preventDefault) {
        // Show error if not 6 digits
        toast.error("Vui lòng nhập đầy đủ 6 chữ số");
      }
      return;
    }

    try {
      console.log("Verifying code:", typeof verificationCode, verificationCode);
      await verifyOTP(verificationCode);
      toast.success("Email đã được xác thực thành công!");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Mã xác thực không đúng hoặc đã hết hạn";
      toast.error(errorMessage);
      // Clear code to allow user to re-enter
      setCode(["", "", "", "", "", ""]);
    }
  };

  //! Back to login page
  const backToLogin = async () => {
    try {
      if (isAuthenticated) await logout(); // clear cookie + reset store
    } finally {
      navigate("/login", { replace: true, state: { email } });
    }
  };

  //! Handle resend code
  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await resendVerificationOTP(email);

      toast.success("Mã xác thực mới đã được gửi!");
      setCountdown(60); // 60 seconds countdown
      setCode(["", "", "", "", "", ""]); // Clear current code
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Không thể gửi lại mã xác thực";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  //! Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  //! Auto-submit khi đủ 6 digits
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleVerifyCode(new Event("submit"));
    }
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br py-12 px-4 sm:px-6 lg:px-8 from-camel/20 to-dark_blue/20">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-2xl shadow-2xl  ">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Xác thực email!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Chúng tôi đã gửi mã xác thực 6 chữ số đến
          </p>
          <p className="text-sm font-medium text-blue-600">{email}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
          <div>
            <label className="sr-only">Mã xác thực</label>
            <div className="flex justify-center space-x-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-camel focus:outline-none"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || code.join("").length !== 6}
              className="font-semibold group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm rounded-md text-white bg-camel hover:bg-camel/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-camel disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang xác thực..." : "Xác thực"}
            </button>
          </div>

          <div className="flex justify-around items-center text-sm">
            <div className="text-center">
              <Link
                to="/verify-choice"
                className="text-camel hover:text-camel/80 font-semibold flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Chọn cách khác
              </Link>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || isResending}
                className="font-semibold text-camel hover:text-camel/80 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isResending
                  ? "Đang gửi..."
                  : countdown > 0
                  ? `Gửi lại sau ${countdown}s`
                  : "Gửi lại mã xác thực"}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={backToLogin}
                className="text-gray-500 font-semibold hover:text-dark_blue flex items-center justify-center"
              >
                Quay lại đăng nhập
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
