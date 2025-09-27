import { useRef, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

// Import Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Intro from "./pages/Intro";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Promotion from "./pages/Promotion";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";

// Verification Pages
import VerificationChoice from "./pages/verification/VerificationChoice";
import EmailVerification from "./pages/verification/EmailVerification";
import OTPVerification from "./pages/verification/OTPVerification";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import ResetPassword from "./pages/reset-password/ResetPassword";

// Import AI Chat Components & Icons & Data
import ChatbotWrapper from "./components/ChatbotWrapper";

// Import Error Page
import NotFound from "./pages/notfound/NotFound";
import Unauthorized from "./pages/unauthorized/Unauthorized";

// Import Admin Pages
import AdminProduct from "./pages/admin/AdminProduct";
import AdminAccount from "./pages/admin/AdminAccount";
import AdminTopping from "./pages/admin/AdminTopping";
import AdminCategory from "./pages/admin/AdminCategory";

// Import Protected Route
import PrivateRoute from "./routes/PrivateRoute";
import EmailRoute from "./routes/EmailRoute";
import GuestRoute from "./routes/GuestRoute";
import StoreGuard from "./routes/StoreGuard";

import { useAuthStore } from "./store/authStore";

import "./App.css";

// Main Component
function App() {
  const { user } = useAuthStore();

  //! Check authentication
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isCheckingAuth = useAuthStore((s) => s.isCheckingAuth);
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    checkAuth(); // gọi đúng 1 lần lúc app mount
  }, [checkAuth]);

  //! Không gọi useChatbot ở đây nữa - sẽ move vào component riêng

  return (
    <Router>
      {/* Toaster should be rendered at the root of the app */}
      <Toaster richColors position="top-right" />
      {/* Chatbot component should be rendered conditionally based on user role */}
      {user && user?.role === "customer" && <ChatbotWrapper />}
      <Routes>
        {/* //* Public Route (Login is not required) */}
        <Route path="/" element={<Home />} />{" "}
        <Route path="/intro" element={<Intro />} />
        <Route path="/menu" element={<StoreGuard><Menu /></StoreGuard>} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Auth />
            </GuestRoute>
          }
        />
        <Route path="/promotion" element={<Promotion />} />
        {/* //* Protected Email Verification Route */}
        <Route
          path="/verify-choice"
          element={
            <EmailRoute>
              <VerificationChoice />
            </EmailRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <EmailRoute>
              <EmailVerification />
            </EmailRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <EmailRoute>
              <OTPVerification />
            </EmailRoute>
          }
        />
        {/* Forgot Password page */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Reset Password page */}
        <Route
          path="/reset-password"
          element={<Navigate to="/forgot-password" replace />}
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />{" "}
        <Route path="*" element={<NotFound />} />{" "}
        {/* //* ------ Customer Route (Registered Customer access is required) ------*/}
        <Route element={<PrivateRoute permittedRole="customer" />}>
          {/* <Route path="/menu" element={<Menu />} />{" "} */}
          {/* Trang giỏ hàng */}
          <Route path="/cart" element={<Cart />} />{" "}
          {/* Trang user sau khi đăng nhập */}
          {/* Trang chi tiết sản phẩm với ID động */}
          <Route path="/checkout" element={<Checkout />} />{" "}
          {/* Trang thanh toán */}
          <Route path="/ordertracking" element={<OrderTracking />} />{" "}
          {/* Trang theo dõi đơn hàng*/}
        </Route>
        {/* //* ------ Manager Route (Manager access is required) ------ */}
        <Route element={<PrivateRoute permittedRole="storeManager" />}>
          {/* Khi truy cập /manager → điều hướng tới /manager/dashboard */}
          <Route
            path="/storeManager"
            element={<Navigate to="/admin/products" replace />}
          />
          {/* Trang quản lý sản phẩm dành riêng cho admin */}
          <Route path="/admin/products" element={<AdminProduct />} />
          <Route path="/admin/accounts" element={<AdminAccount />} />
          <Route path="/admin/toppings" element={<AdminTopping />} />
          <Route path="/admin/categories" element={<AdminCategory />} />
        </Route>
        {/* //* ------ Staff Route (Staff access is required) ------ */}
        <Route element={<PrivateRoute permittedRole="staff" />}>
          {/* Khi truy cập /manager → điều hướng tới /manager/dashboard */}
          <Route
            path="/staff"
            element={<Navigate to="/staff/dashboard" replace />}
          />
        </Route>
        {/* //* ------ Admin Route (Admin access is required) ------*/}
        <Route element={<PrivateRoute permittedRole="admin" />}>
          <Route
            path="/admin"
            element={<Navigate to="/admin/products" replace />}
          />
          {/* Trang quản lý sản phẩm dành riêng cho admin */}
          <Route path="/admin/products" element={<AdminProduct />} />
          <Route path="/admin/accounts" element={<AdminAccount />} />
          <Route path="/admin/toppings" element={<AdminTopping />} />
          <Route path="/admin/categories" element={<AdminCategory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
