import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function GuestRoute({ children }) {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();
  
  //! Xác định route đích dựa trên vai trò người dùng
  const getTargetRouteByRole = (userRole) => {
    const roleRoutes = {
      admin: "/admin/products",
      storeManager: "/store-manager/products",
      customer: "/menu",
    };

    // Nếu không có vai trò khớp, chuyển về homepage
    return roleRoutes[userRole] || "/";
  };

  //! Tránh giật khi đang hydrate phiên
  if (isCheckingAuth) return null; 

  //! Chưa đăng nhập -> cho vào trang guest (login/register)
  if (!isAuthenticated) return children;

  //! Đã đăng nhập: - Chưa verify -> ép sang verify-choice (truyền email để hiển thị)
  if (!user?.isVerified) {
    return (
      <Navigate to="/verify-choice" state={{ email: user?.email }} replace />
    );
  }

  //! Đã đăng nhập và đã verify -> chuyển về trang theo vai trò
  const targetRoute = getTargetRouteByRole(user.role);
  console.log("GuestRoute redirecting to:", targetRoute, "for role:", user.role);
  
  return <Navigate to={targetRoute} replace />;
}
