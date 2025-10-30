import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useStoreSelectionStore } from "../store/storeSelectionStore";
import Notification from "../components/ui/Notification";
import { useEffect, useRef } from "react";

const PrivateRoute = ({ permittedRole }) => {
  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();
  const { 
    loadCartFromBackend, 
    currentStoreId, 
    isAuthenticated: cartAuthenticated,
    setAuthStatus 
  } = useCartStore(); 
  
  const { selectedStore } = useStoreSelectionStore();
  
  const notificationShown = useRef(false);
  const cartLoaded = useRef(false);

  // Chỉ đồng bộ auth nếu là customer
  useEffect(() => {
    if (isAuthenticated && user?.role === "customer" && !cartAuthenticated) {
      setAuthStatus(true);
    }
  }, [isAuthenticated, user, cartAuthenticated, setAuthStatus]);

  // Load cart khi user là customer và có storeId
  useEffect(() => {
    const loadCartIfNeeded = async () => {
      if (!isAuthenticated || user?.role !== "customer" || cartLoaded.current) {
        return;
      }

      try {
        let effectiveStoreId = currentStoreId;

        //  Dùng store đang được chọn nếu currentStoreId chưa có
        if (!effectiveStoreId && selectedStore?._id) {
          effectiveStoreId = selectedStore._id;
          console.log("[PrivateRoute] Using selected store:", effectiveStoreId);
        }

        //  Nếu vẫn chưa có storeId thì bỏ qua
        if (!effectiveStoreId) {
          console.warn("⚠️ [PrivateRoute] No storeId available, skipping cart load");
          return;
        }

        console.log("[PrivateRoute] Loading cart from backend...", {
          storeId: effectiveStoreId,
          userId: user._id,
        });

        await loadCartFromBackend(effectiveStoreId);
        cartLoaded.current = true;

        console.log(" [PrivateRoute] Cart loaded successfully");
      } catch (error) {
        console.error(" [PrivateRoute] Error loading cart:", error);
      }
    };

    // ⏳ Đợi 500ms để đảm bảo auth store đã sẵn sàng
    const timer = setTimeout(loadCartIfNeeded, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, currentStoreId, loadCartFromBackend, selectedStore]);

  // Reset cartLoaded khi user logout hoặc đổi user
  useEffect(() => {
    cartLoaded.current = false;
  }, [user?._id, isAuthenticated]);

  // Reset notification khi component bị unmount
  useEffect(() => {
    return () => {
      notificationShown.current = false;
    };
  }, []);

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang kiểm tra xác thực...</div>
      </div>
    );
  }

  // Chưa login → chuyển hướng
  if (!isAuthenticated || !user) {
    if (!notificationShown.current) {
      Notification.info("Vui lòng đăng nhập để tiếp tục");
      notificationShown.current = true;
    }
    return <Navigate to="/login" replace />;
  }

  // Không đủ quyền → chuyển hướng
  if (permittedRole && user.role !== permittedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  console.log(" [PrivateRoute] Authenticated user:", user);
  return <Outlet />;
};

export default PrivateRoute;
