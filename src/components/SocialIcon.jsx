import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Notification from "./Notification";

function SocialIcon() {
  const { loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  // Check if we should show Google button
  const isProduction = import.meta.env.PROD;
  const isLocalhost = window.location.hostname === 'localhost';
  const hasGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  // Only show Google button in production or if explicitly enabled for localhost
  const shouldShowGoogleButton = hasGoogleClientId && 
    (isProduction || import.meta.env.VITE_ENABLE_GOOGLE_OAUTH_DEV === 'true');

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google login started");
    try {
      // Call authStore function to handle Google login
      const result = await loginWithGoogle(credentialResponse.credential);
      console.log("Google login result:", result);

      if (result.requiresVerification) {
        console.log("Verification required, navigating to /verify-choice");
        
        // Show notification about verification requirement
        Notification.info(
          "Xác thực bổ sung",
          result.message || "Vui lòng xác thực email để hoàn tất đăng nhập"
        );

        // Redirect to verification choice page 
        navigate("/verify-choice", {
          state: {
            email: result.email,
            provider: "google",
            reason: result.reason,
          },
        });
      } else {
        console.log("No verification needed, navigating to home");
        Notification.success("Đăng nhập Google thành công!");
        navigate("/");
      }
    } catch (error) {
      console.error("Google login error:", error);

      // More specific error handling
      const errorMessage =
        error.response?.data?.message || error.message || "Vui lòng thử lại";
      Notification.error("Đăng nhập Google thất bại", errorMessage);
    }
  };

  //! Handle Google OAuth errors
  const handleGoogleError = (error) => {
    Notification.error(
      "Đăng nhập Google thất bại",
      "Người dùng từ chối hoặc có lỗi xác thực"
    );
  };

  return (
    <div className="text-center">
      {/* Google Login Button */}
      <div className="mx-2 inline-block">
        {shouldShowGoogleButton ? (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            auto_select={false}
            theme="outline"
            size="medium"
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
          />
        ) : (
          <div className="text-gray-500 text-sm p-2 border border-gray-300 rounded-lg">
            Google OAuth (Chỉ khả dụng ở production)
          </div>
        )}
      </div>
    </div>
  );
}

export default SocialIcon;
