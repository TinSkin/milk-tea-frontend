import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../store/authStore";
import Notification from "./Notification";

function SocialIcon() {
  const { loginWithGoogle } = useAuthStore();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("🔍 Google login success:", credentialResponse);

      // Call authStore function to handle Google login
      await loginWithGoogle(credentialResponse.credential);

      Notification.success("Đăng nhập Google thành công!");
    } catch (error) {
      console.error("❌ Google login error:", error);
      Notification.error("Đăng nhập Google thất bại", error.message || "Vui lòng thử lại");
    }
  };

  const handleGoogleError = () => {
    console.error("❌ Google login failed");
    Notification.error("Đăng nhập Google thất bại", "Vui lòng thử lại");
  };

  return (
    <div className="text-center">
      {/* Google Login Button */}
      <div className="mx-2 inline-block">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="outline"
          size="medium"
          text="signin_with"
          shape="rectangular"
        />
      </div>
    </div>
  );
}

export default SocialIcon;
