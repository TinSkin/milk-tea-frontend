import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const PrivateRoute = ({ permittedRole }) => {
  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();

  //! Hiển thị trạng thái loading khi đang kiểm tra xác thực
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang kiểm tra xác thực...</div>
      </div>
    );
  }

  //! Nếu người dùng chưa được xác thực
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  //! Nếu yêu cầu quyền cụ thể nhưng người dùng không có quyền đó
  if (permittedRole && user.role !== permittedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("User is authenticated and authorized:", user);

  //! Nếu người dùng đã đăng nhập và có quyền yêu cầu
  return <Outlet />;
};

export default PrivateRoute;
