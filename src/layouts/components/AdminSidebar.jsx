import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Shield,
  Tag,
  Coffee,
  MapPin,
  ChevronDown,
  ChevronRight,
  Store,
  Globe,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useSidebar } from "../hooks/useSidebar.jsx";

const AdminSidebar = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const [openMenus, setOpenMenus] = useState(new Set());
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: BarChart3,
      path: "/admin/dashboard",
    },
    {
      id: "products",
      title: "Quản lý sản phẩm",
      icon: Package,
      children: [
        {
          title: "Danh sách sản phẩm",
          path: "/admin/products",
        },
        {
          title: "Thêm sản phẩm",
          path: "/admin/products/add",
        },
      ],
    },
    {
      id: "categories",
      title: "Danh mục",
      icon: Tag,
      path: "/admin/categories",
    },
    {
      id: "toppings",
      title: "Topping",
      icon: Coffee,
      path: "/admin/toppings",
    },
    {
      id: "stores",
      title: "Cửa hàng",
      icon: Store,
      path: "/admin/stores",
    },
    {
      id: "orders",
      title: "Đơn hàng",
      icon: ShoppingCart,
      path: "/admin/orders",
    },
    {
      id: "accounts",
      title: "Tài khoản",
      icon: Users,
      path: "/admin/accounts",
    },
    {
      id: "system",
      title: "Hệ thống",
      icon: Globe,
      children: [
        {
          title: "Cài đặt chung",
          path: "/admin/system/settings",
        },
        {
          title: "Phân quyền",
          path: "/admin/system/permissions",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {}} // Remove toggle functionality from backdrop
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 transition-all duration-300 ease-in-out ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-16 translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center p-4 border-b border-gray-200">
            {isOpen ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">Admin Panel</h2>
                  <p className="text-xs text-gray-500">Quản trị hệ thống</p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.children ? (
                  // Menu có submenu
                  <div>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        openMenus.has(item.id)
                          ? "bg-blue-600/10 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        {isOpen && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </div>
                      {isOpen && (
                        <div className="transition-transform duration-200">
                          {openMenus.has(item.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Submenu */}
                    {isOpen && openMenus.has(item.id) && (
                      <div className="mt-2 space-y-1 ml-8">
                        {item.children.map((child, index) => (
                          <NavLink
                            key={index}
                            to={child.path}
                            className={({ isActive }) =>
                              `block p-2 rounded-lg text-sm transition-colors ${
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`
                            }
                          >
                            {child.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Menu thường
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {isOpen && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {isOpen && <span className="font-medium">Đăng xuất</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 lg:hidden"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>
    </>
  );
};

export default AdminSidebar;