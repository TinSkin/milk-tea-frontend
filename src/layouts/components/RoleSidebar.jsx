import SidebarBase from "./SidebarBase";
import { navSchema } from "./nav/nav.schema";
import { filterNavByRole } from "./nav/filterNavByRole";
import { sidebarRoleConfig } from "./nav/sidebar.roleConfig";
import { useAuthStore } from "../../store/authStore";
import { useManagerStore } from "../../store/managerStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function RoleSidebar() {
  const { user, logout } = useAuthStore(); // user.role: 'admin' | 'manager' | ...
  const { storeInfo, fetchMyStore } = useManagerStore();
  const navigate = useNavigate();

  // Lấy role hiện tại và config cho role đó
  const role = user?.role || "storeManager";
  const cfg = sidebarRoleConfig[role] || sidebarRoleConfig.manager;

  // Fetch store info cho manager
  useEffect(() => {
    if (role === "storeManager" && !storeInfo) {
      fetchMyStore();
    }
  }, [role, storeInfo, fetchMyStore]);

  // Brand (logo + tiêu đề + mô tả phụ) — thêm subtitle động cho manager
  const brand = { ...cfg.brand };
  
  if (role === "storeManager" && storeInfo) {
    brand.subtitle = storeInfo.storeName || storeInfo.name;
  }

  // Lọc nav theo role và thêm basePath
  const filteredItems = filterNavByRole(navSchema, role);

  // Helper để thêm basePath vào paths
  const addBasePath = (items, basePath) => {
    return items.map((item) => {
      const newItem = { ...item };
      if (newItem.path) {
        newItem.path = basePath + newItem.path;
      }
      if (newItem.children) {
        newItem.children = addBasePath(newItem.children, basePath);
      }
      return newItem;
    });
  };

  const navItems = addBasePath(filteredItems, cfg.basePath);

  //! Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarBase
      brand={brand}
      navItems={navItems}
      activeColor={cfg.activeColor}
      brandColor={cfg.brandColor}
      onLogout={handleLogout}
    />
  );
}
