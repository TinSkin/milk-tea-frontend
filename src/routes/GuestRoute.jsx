import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function GuestRoute({ children }) {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  // Tránh giật khi đang hydrate phiên
  if (isCheckingAuth) return null; // hoặc spinner nhỏ

  // Chưa đăng nhập -> cho vào trang guest (login/register)
  if (!isAuthenticated) return children;

  // Đã đăng nhập:
  // - Chưa verify -> ép sang verify-choice (truyền email để hiển thị)
  if (!user?.isVerified) {
    return (
      <Navigate to="/verify-choice" state={{ email: user?.email }} replace />
    );
  }

  // - Đã verify -> về trang chủ (hoặc nơi bạn muốn)
  return <Navigate to="/" replace />;
}
