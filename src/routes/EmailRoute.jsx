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
  
  //! Nếu người dùng đã verify hoàn toàn và không có Google verification pending, ngăn truy cập vào trang verify
  if (isVerified && !hasGoogleVerification) return <Navigate to="/" replace />;

  //! /verify-otp và /verify-choice: bắt buộc đã đăng nhập & (chưa verify || có Google verification pending)
  if (path === "/verify-otp" || path === "/verify-choice") {
    if ((isAuthenticated && user && (!isVerified || hasGoogleVerification)) || hasGoogleVerification) {
      return children;
    }
    return <Navigate to="/login" state={{ from: path }} replace />;
  }

  //! /verify-email: cho vào nếu có token (đi từ email) hoặc đã đăng nhập nhưng (chưa verify || có Google verification)
  if (path === "/verify-email") {
    if (hasToken || (isAuthenticated && user && (!isVerified || hasGoogleVerification)) || hasGoogleVerification) {
      return children;
    }
    return <Navigate to="/login" state={{ from: path }} replace />;
  }

  //! Mặc định: nếu chưa đăng nhập thì chuyển hướng về login
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  //! Nếu người dùng đã xác thực nhưng email chưa được verify, cho phép truy cập trang xác thực email
  return children;
};

export default EmailRoute;
