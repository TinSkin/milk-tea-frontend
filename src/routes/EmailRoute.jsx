import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const EmailRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [params] = useSearchParams();

  const path = location.pathname;
  const hasToken = !!params.get("token");
  const isVerified = !!user?.isVerified;

  // console.log("DEBUG !!!", isAuthenticated, user, isVerified);

  // Has verify: prevent access to all verify pages
  if (isVerified) return <Navigate to="/" replace />;

  // /verify-otp và /verify-choice: bắt buộc đã đăng nhập & chưa verify
  if (path === "/verify-otp" || path === "/verify-choice") {
    if (isAuthenticated && user && !isVerified) return children;
    return <Navigate to="/login" state={{ from: path }} replace />;
  }

  // /verify-email: cho vào nếu có token (đi từ email) hoặc đã đăng nhập nhưng chưa verify
  if (path === "/verify-email") {
    if (hasToken || (isAuthenticated && user && !isVerified)) return children;
    return <Navigate to="/login" state={{ from: path }} replace />;
  }

  // Default: if not login redirect to login
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  // If user is authenticated but email is not verified, allow access to the email verification page
  return children;
};

export default EmailRoute;
