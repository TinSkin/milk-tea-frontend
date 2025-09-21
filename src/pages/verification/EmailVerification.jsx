import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faRefresh,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";

const EmailVerification = () => {
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [hasVerified, setHasVerified] = useState(false); // Add flag to prevent double verification
  const verificationAttempted = useRef(false); // Add ref to prevent double verification
  const [params] = useSearchParams();

  const location = useLocation();
  const navigate = useNavigate();

  const {
    resendVerificationEmail,
    verifyEmail,
    user,
    isAuthenticated,
    logout,
    pendingVerification,
  } = useAuthStore();

  const emailFromState = location.state?.email || "";
  const providerFromState = location.state?.provider || "";
  const reasonFromState = location.state?.reason || "";

  // Check if this is Google verification flow
  const isGoogleVerification =
    providerFromState === "google" ||
    pendingVerification?.provider === "google";

  const email =
    emailFromState || pendingVerification?.email || user?.email || "";
  const verificationReason =
    reasonFromState || pendingVerification?.reason || "";

  //! Lấy token từ URL params
  const token = params.get("token");

  //! Initialize countdown
  useEffect(() => {
    if (!email) return;

    const now = Date.now();

    // Timestamp pass through navigate(..., { state: { resentAt: Date.now() } })
    const resentAtState = location.state?.resentAt;

    // Saved key for email in localStorage
    const key = `resend_ts:${email}`;
    const resentAtStored = Number(localStorage.getItem(key));

    const startTs =
      resentAtState ||
      (Number.isFinite(resentAtStored) ? resentAtStored : null);
    if (!startTs) return;

    const elapsed = Math.floor((now - startTs) / 1000);
    const left = Math.max(0, 60 - elapsed);

    if (left > 0) setCountdown(left);
  }, [email, location.state]);

  //! Verify email when token is present
  useEffect(() => {
    if (!token || hasVerified || verificationAttempted.current) return; // Multiple checks

    console.log("Starting verification for token:", token);
    
    // Prevent double verification
    const verifiedKey = `verified_${token}`;
    if (sessionStorage.getItem(verifiedKey)) {
      console.log("Token already verified, navigating...");
      // Already verified this token, just navigate
      navigate("/", { replace: true });
      return;
    }

    // Set flag immediately to prevent double execution
    verificationAttempted.current = true;

    (async () => {
      try {
        setIsVerifying(true);
        setHasVerified(true); // Set flag immediately to prevent double call
        
        console.log("Calling verifyEmail API...");
        await verifyEmail(token); // POST /verify-email
        console.log("verifyEmail API completed");

        // Mark as verified to prevent double verification
        sessionStorage.setItem(verifiedKey, "true");

        // Temporarily disable toast to debug
        toast.success("Xác minh email thành công!");

        navigate("/", { replace: true });
      } catch (e) {
        console.log("verifyEmail API failed:", e);
        setHasVerified(false); // Reset flag on error
        verificationAttempted.current = false; // Reset ref on error
        if (e.status === 410) {
          toast.error("Liên kết đã hết hạn. Hãy yêu cầu gửi lại liên kết.");
        } else {
          toast.error(e.message || "Xác minh thất bại. Vui lòng thử lại.");
        }
      } finally {
        setIsVerifying(false);
      }
    })();
  }, [token, navigate]); // Remove verifyEmail from deps to prevent double call

  //! Back to login page
  const backToLogin = async () => {
    try {
      if (isAuthenticated) await logout(); // clear cookie + reset store
    } finally {
      navigate("/login", { replace: true });
    }
  };

  //! Handle resend email
  const handleResendEmail = async () => {
    if (countdown > 0 || !email) {
      if (!email) toast.error("Không xác định được email để gửi lại.");
      return;
    }
    setIsResending(true);
    try {
      const resp = await resendVerificationEmail(email); // phải là axios response
      toast.success("Email xác thực đã được gửi lại!");

      const retry = Number(resp?.headers?.["retry-after"]);
      const sec = Number.isFinite(retry) && retry > 0 ? retry : 60;
      setCountdown(sec);
      localStorage.setItem(`resend_ts:${email}`, String(Date.now()));
    } catch (error) {
      const retry = Number(error?.response?.headers?.["retry-after"]);
      const sec = Number.isFinite(retry) && retry > 0 ? retry : 60;
      setCountdown(sec);
      toast.error(
        error?.response?.data?.message || "Không thể gửi lại email xác thực"
      );
    } finally {
      setIsResending(false);
    }
  };

  //! Countdown timer
  useEffect(() => {
    if (countdown <= 0) return; //* When timer run to 0, no action is taken, which means not create new timer

    //* Create interval every second
    // const t = setInterval(..., 1000); -> Tạo interval chạy mỗi 1 giây.
    // setCountdown(s => Math.max(0, s - 1)) -> Dùng functional update (s => s - 1) để luôn lấy giá trị state mới nhất, tránh lỗi “stale closure”.
    // Math.max(0, …) -> đảm bảo không xuống số âm.
    const t = setTimeout(() => setCountdown((s) => Math.max(0, s - 1)), 1000);

    //* Hàm cleanup: mỗi lần countdown đổi (và khi unmount), interval cũ được xoá để không bị chồng/nhân đôi và không rò rỉ.
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br py-12 px-4 sm:px-6 lg:px-8 from-camel/20 to-dark_blue/20">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="h-8 w-8 text-blue-600"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isGoogleVerification ? "Xác thực bổ sung" : "Kiểm tra email"}
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            {isGoogleVerification
              ? "Để bảo mật tài khoản Google, vui lòng xác nhận quyền sở hữu email"
              : "Chúng tôi đã gửi link xác thực đến"}
          </p>
          <p className="text-sm font-medium text-blue-600 mb-2">{email}</p>
          {isGoogleVerification && verificationReason && (
            <p className="text-xs text-gray-500 mb-4">
              Lý do:{" "}
              {verificationReason === "New user account"
                ? "Tài khoản mới"
                : verificationReason === "Production environment"
                ? "Môi trường production"
                : verificationReason === "High-value order"
                ? "Đơn hàng giá trị cao"
                : verificationReason}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Làm theo các bước sau:
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-camel rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <p className="text-sm text-gray-700">
                Mở ứng dụng email trên điện thoại hoặc máy tính
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-camel rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <p className="text-sm text-gray-700">
                Tìm email từ <strong>Penny Milk Tea</strong>
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-camel rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <p className="text-sm text-gray-700">
                {isGoogleVerification
                  ? 'Click vào nút "Xác nhận tài khoản"'
                  : 'Click vào nút "Xác thực email"'}
              </p>
            </div>
          </div>

          {isGoogleVerification && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Lưu ý:</strong> Đây là bước xác thực bổ sung cho tài
                khoản Google của bạn nhằm đảm bảo bảo mật cao hơn.
              </p>
            </div>
          )}
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="h-5 w-5 text-green-600 mt-0.5"
            />
            <div className="text-sm">
              <p className="text-green-800 font-medium">
                Sau khi click link, bạn sẽ được chuyển về trang đăng nhập
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={countdown > 0 || isResending}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-camel disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon
              icon={faRefresh}
              className={`mr-2 ${isResending ? "animate-spin" : ""}`}
            />
            {isResending
              ? "Đang gửi..."
              : countdown > 0
              ? `Gửi lại sau ${countdown}s`
              : "Gửi lại email"}
          </button>

          <div className="flex justify-between items-center text-sm font-semibold">
            <button
              onClick={() => navigate("/verify-choice", { state: { email } })}
              className="text-camel hover:text-camel/80 font-semibold"
            >
              ← Chọn cách khác
            </button>

            <button
              onClick={backToLogin}
              className="text-gray-500 font-semibold hover:text-dark_blue"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>

        {/* Help */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 text-center">
            Không thấy email? Kiểm tra thư mục spam hoặc thử gửi lại
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
