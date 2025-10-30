import { useRef, useEffect, useState, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

// Core components - loaded immediately
import { useAuthStore } from "./store/authStore";
import PrivateRoute from "./routes/PrivateRoute";
import EmailRoute from "./routes/EmailRoute";
import GuestRoute from "./routes/GuestRoute";
import StoreGuard from "./routes/StoreGuard";

import AdminOrderDetailModal from "./components/features/admin/OrderDetailModal";
// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Error Boundary Component
import ErrorBoundary from "./components/ui/ErrorBoundary";

// Lazy load all page components for better performance
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Intro = lazy(() => import("./pages/Intro"));
const Menu = lazy(() => import("./pages/Menu"));
const Cart = lazy(() => import("./pages/Cart"));
const Promotion = lazy(() => import("./pages/Promotion"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));

// Verification Pages
const VerificationChoice = lazy(() =>
  import("./pages/verification/VerificationChoice")
);
const EmailVerification = lazy(() =>
  import("./pages/verification/EmailVerification")
);
const OTPVerification = lazy(() =>
  import("./pages/verification/OTPVerification")
);
const ForgotPassword = lazy(() =>
  import("./pages/forgot-password/ForgotPassword")
);
const ResetPassword = lazy(() =>
  import("./pages/reset-password/ResetPassword")
);

// Layouts
const StoreManagerLayout = lazy(() => import("./layouts/StoreManagerLayout"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));

// Chatbot (conditionally loaded)
const ChatbotWrapper = lazy(() =>
  import("./components/features/chatbot/ChatbotWrapper")
);

// Error Pages
const NotFound = lazy(() => import("./pages/notfound/NotFound"));
const Unauthorized = lazy(() => import("./pages/unauthorized/Unauthorized"));
const ComingSoon = lazy(() => import("./pages/comingsoon/Comingsoon"));

// Admin Pages
const AdminProduct = lazy(() => import("./pages/admin/AdminProduct"));
const AdminCategory = lazy(() => import("./pages/admin/AdminCategory"));
const AdminTopping = lazy(() => import("./pages/admin/AdminTopping"));
const AdminAccount = lazy(() => import("./pages/admin/AdminAccount"));
const AdminStore = lazy(() => import("./pages/admin/AdminStore"));
const AdminRequest = lazy(() => import("./pages/admin/AdminRequest"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));

// Manager Pages
const ManagerDashboard = lazy(() => import("./pages/manager/ManagerDashboard"));
const ManagerProduct = lazy(() => import("./pages/manager/ManagerProduct"));
const ManagerCategory = lazy(() => import("./pages/manager/ManagerCategory"));
const ManagerTopping = lazy(() => import("./pages/manager/ManagerTopping"));
const ManagerOrders = lazy(() => import("./pages/manager/ManagerOrders"));
const ManagerCustomers = lazy(() => import("./pages/manager/ManagerCustomers"));
const ManagerAccount = lazy(() => import("./pages/manager/ManagerAccount"));
const ManagerSettings = lazy(() => import("./pages/manager/ManagerSettings"));
const ManagerRequest = lazy(() => import("./pages/manager/ManagerRequest"));

import "./App.css";

function App() {
  const { user, checkAuth } = useAuthStore();
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [orderId, setOrderId] = useState(null);

  //! Kiểm tra xác thực chỉ một lần khi mount
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <Router>
        {/* Để thông báo ở đây cho Notification hiện ở tất cả các trang */}
        <Toaster richColors position="top-right" />

        {/* Hiện chatbot cho khách hàng đã đăng nhập */}
        {user?.role === "customer" && (
          <Suspense fallback={null}>
            <ChatbotWrapper />
          </Suspense>
        )}

        {/* Sử dụng <Suspense> để lazy load các trang */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/promotion" element={<Promotion />} />
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
            {/* Email Verification Routes */}
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

            {/* Password Reset Routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/reset-password"
              element={<Navigate to="/forgot-password" replace />}
            />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Cart - accessible to guests */}
            <Route path="/cart" element={<Cart />} />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            {/* Customer Routes - Authentication Required */}
            <Route element={<PrivateRoute permittedRole="customer" />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-tracking/:id" element={<OrderTracking />} />
              <Route path="/order-history" element={<OrderHistory />} />
            </Route>
            {/* Store Manager Routes */}
            <Route element={<PrivateRoute permittedRole="storeManager" />}>
              <Route path="/store-manager" element={<StoreManagerLayout />}>
                <Route
                  index
                  element={<Navigate to="/store-manager/dashboard" replace />}
                />
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="products" element={<ManagerProduct />} />
                <Route path="categories" element={<ManagerCategory />} />
                <Route path="toppings" element={<ManagerTopping />} />
                <Route path="orders" element={<ManagerOrders />} />
                <Route path="customers" element={<ManagerCustomers />} />
                <Route path="accounts" element={<ManagerAccount />} />
                <Route path="settings" element={<ManagerSettings />} />
                <Route path="requests" element={<ManagerRequest />} />
              </Route>
            </Route>
            {/* Staff Routes */}
            <Route element={<PrivateRoute permittedRole="staff" />}>
              <Route
                path="/staff"
                element={<Navigate to="/staff/dashboard" replace />}
              />
            </Route>
            {/* Admin Routes */}
            <Route element={<PrivateRoute permittedRole="admin" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route
                  index
                  element={<Navigate to="/admin/products" replace />}
                />
                <Route
                  path="dashboard"
                  element={<Navigate to="/comingsoon" replace />}
                />
                <Route path="products" element={<AdminProduct />} />
                <Route path="categories" element={<AdminCategory />} />
                <Route path="toppings" element={<AdminTopping />} />
                <Route path="accounts" element={<AdminAccount />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="stores" element={<AdminStore />} />
                <Route path="requests" element={<AdminRequest />} />
                <Route path="system/settings" element={<Navigate to="/comingsoon" replace />} />
                <Route path="system/permissions" element={<Navigate to="/comingsoon" replace />} />
              </Route>
            </Route>
            <Route path="/comingsoon" element={<ComingSoon />} />
            {/* 404 - Must be last route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        {/* {isOrderModalOpen && (
            <AdminOrderDetailModal
              orderId={orderId}
              isOpen={isOrderModalOpen}
              onClose={() => setOrderModalOpen(false)}
            />
          )} */}
      </Router>
    </ErrorBoundary>
  );
}

export default App;
