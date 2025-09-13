import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Import store for managing authentication state
import { useAuthStore } from "../store/authStore";

const PrivateRoute = ({ permittedRole }) => {
  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();

  //! Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang kiểm tra xác thực...</div>
      </div>
    );
  }

  //! If user is not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  //! If specific role is required but user doesn't have it
  if (permittedRole && user.role !== permittedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  //! If the user is logged in and has the required role
  return <Outlet />;
};

export default PrivateRoute;
