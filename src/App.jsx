import { useRef, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

// Import Store Manager Layout
import StoreManagerLayout from "./layouts/StoreManagerLayout";
import AdminLayout from "./layouts/AdminLayout";

// Import Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Intro from "./pages/Intro";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Promotion from "./pages/Promotion";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import OrderHistory from "./pages/OrderHistory";


// Verification Pages
import VerificationChoice from "./pages/verification/VerificationChoice";
import EmailVerification from "./pages/verification/EmailVerification";
import OTPVerification from "./pages/verification/OTPVerification";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import ResetPassword from "./pages/reset-password/ResetPassword";

// Import AI Chat Components & Icons & Data
import ChatbotWrapper from "./components/features/chatbot/ChatbotWrapper";

// Import Error Page
import NotFound from "./pages/notfound/NotFound";
import Unauthorized from "./pages/unauthorized/Unauthorized";

// Import Admin Pages
import AdminProduct from "./pages/admin/AdminProduct";
import AdminCategory from "./pages/admin/AdminCategory";
import AdminTopping from "./pages/admin/AdminTopping";
import AdminAccount from "./pages/admin/AdminAccount";

// Import Store Manager Pages
import ManagerDashboard from "./pages/store-manager/ManagerDashboard";
import ManagerProduct from "./pages/store-manager/ManagerProduct";
import ManagerCategory from "./pages/store-manager/ManagerCategory";
import ManagerTopping from "./pages/store-manager/ManagerTopping";
import ManagerOrders from "./pages/store-manager/ManagerOrders";
import ManagerCustomers from "./pages/store-manager/ManagerCustomers";
import ManagerAccount from "./pages/store-manager/ManagerAccount";
import ManagerSettings from "./pages/store-manager/ManagerSettings";

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
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    checkAuth(); // gọi đúng 1 lần lúc app mount
  }, [checkAuth]);

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
        <Route
          path="/menu"
          element={
            <StoreGuard>
              <Menu />
            </StoreGuard>
          }
        />
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
        <Route path="/order-history-test" element={<OrderHistory />} />
        {/* //* ------ Customer Route (Registered Customer access is required) ------*/}
        <Route element={<PrivateRoute permittedRole="customer" />}>
          {/* Trang giỏ hàng */}
          <Route path="/cart" element={<Cart />} />
          {/* Trang thanh toán */}
          <Route path="/checkout" element={<Checkout />} />
          {/* Trang theo dõi đơn hàng*/}
          <Route path="/order-tracking/:id" element={<OrderTracking />} />
             {/* Trang xem lịch sử đơn hàng*/}
          <Route path="/order-history" element={<OrderHistory />} />
        </Route>
        {/* //* ------ Manager Route (Manager access is required) ------ */}
        <Route element={<PrivateRoute permittedRole="storeManager" />}>
          <Route path="/store-manager" element={<StoreManagerLayout />}>
            {/* Khi truy cập /store-manager → điều hướng tới /store-manager/dashboard */}
            <Route
              index
              element={<Navigate to="/store-manager/dashboard" replace />}
            />
            {/* Trang dashboard */}
            <Route path="dashboard" element={<ManagerDashboard />} />
            {/* Trang quản lý sản phẩm dành riêng cho cửa hàng trưởng */}
            <Route path="products" element={<ManagerProduct />} />
            <Route path="categories" element={<ManagerCategory />} />
            <Route path="toppings" element={<ManagerTopping />} />
            {/* Trang quản lý đơn hàng và khách hàng */}
            <Route path="orders" element={<ManagerOrders />} />
            <Route path="customers" element={<ManagerCustomers />} />
            {/* Trang quản lý tài khoản và cài đặt */}
            <Route path="accounts" element={<ManagerAccount />} />
            <Route path="settings" element={<ManagerSettings />} />
          </Route>
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
          <Route path="/admin" element={<AdminLayout />}>
            {/* Khi truy cập /admin → điều hướng tới /admin/products */}
            <Route
              index
              element={<Navigate to="/admin/products" replace />}
            />
            {/* Trang quản lý sản phẩm dành riêng cho admin */}
            <Route path="products" element={<AdminProduct />} />
            <Route path="categories" element={<AdminCategory />} />
            <Route path="toppings" element={<AdminTopping />} />
            <Route path="accounts" element={<AdminAccount />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
