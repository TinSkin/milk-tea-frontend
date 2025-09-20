import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const EmailRoute = ({ children }) => {
  const { user, isAuthenticated, pendingVerification } = useAuthStore();
  const location = useLocation();
  const [params] = useSearchParams();

  const path = location.pathname;
  const hasToken = !!params.get("token");
  const isVerified = !!user?.isVerified;
  const hasGoogleVerification = !!pendingVerification?.provider;
  
  // If user is fully verified and there's no pending Google verification, prevent access to verify pages
  if (isVerified && !hasGoogleVerification) return <Navigate to="/" replace />;

  // /verify-otp và /verify-choice: bắt buộc đã đăng nhập & (chưa verify || có Google verification pending)
  if (path === "/verify-otp" || path === "/verify-choice") {
    if ((isAuthenticated && user && (!isVerified || hasGoogleVerification)) || hasGoogleVerification) {
      return children;
    }
    return <Navigate to="/login" state={{ from: path }} replace />;
  }

  // /verify-email: cho vào nếu có token (đi từ email) hoặc đã đăng nhập nhưng (chưa verify || có Google verification)
  if (path === "/verify-email") {
    if (hasToken || (isAuthenticated && user && (!isVerified || hasGoogleVerification)) || hasGoogleVerification) {
      return children;
    }
    return <Navigate to="/login" state={{ from: path }} replace />;
  }

  // Default: if not login redirect to login
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  // If user is authenticated but email is not verified, allow access to the email verification page
  return children;
};

export default EmailRoute;
