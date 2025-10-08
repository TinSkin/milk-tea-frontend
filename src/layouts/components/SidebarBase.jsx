import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, ChevronRight, Menu, LogOut } from "lucide-react";
import { useSidebar } from "../hooks/useSidebar";

export default function SidebarBase({
  // Thông tin thương hiệu hiển thị ở đầu sidebar (logo + tiêu đề + mô tả phụ)
  // Ví dụ: { icon: Shield, title: "Admin Panel", subtitle: "Quản trị hệ thống" }
  brand,

  // Danh sách nav cần hiển thị trên sidebar
  // Mỗi phần tử có thể là: { id, title, icon, path } hoặc { id, title, icon, children: [...] }
  navItems,

  // Màu nền cho mục đang được chọn (Tailwind class)
  activeColor = "bg-green_starbuck",

  // Màu nền cho phần logo / thương hiệu (Tailwind class)
  brandColor = "bg-green_starbuck",

  // Hàm xử lý khi người dùng bấm “Đăng xuất”
  onLogout,
}) {
  const { isOpen, toggleSidebar } = useSidebar();
  const [openMenus, setOpenMenus] = useState(new Set());

  //! Đóng / mở các nhóm menu có submenu
  const toggleMenu = (navId) => {
    setOpenMenus((prev) => {
      const newSet = new Set(prev);
      newSet.has(navId) ? newSet.delete(navId) : newSet.add(navId);
      return newSet;
    });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {}} // Remove toggle functionality from backdrop
        />
      )}

      {/* Thanh sidebar chính */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 transition-all duration-300 ease-in-out ${
          isOpen ? "w-64 translate-x-0" : "w-16 translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Khu vực logo + tiêu đề */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {isOpen ? (
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 ${brandColor} rounded-lg flex items-center justify-center`}
                >
                  {brand.icon && <brand.icon className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{brand.title}</h2>
                  {brand.subtitle && (
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {brand.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`w-8 h-8 ${brandColor} rounded-lg flex items-center justify-center`}
              >
                {brand.icon && <brand.icon className="w-5 h-5 text-white" />}
              </div>
            )}
          </div>

          {/* Danh sách menu điều hướng */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems && navItems.length > 0 ? (
              navItems.map((item) => (
                <div key={item.id}>
                  {item.children ? (
                    // Menu có submenu
                    <div>
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className={`w-full flex items-center ${
                          isOpen ? "justify-between" : "justify-center"
                        } p-3 rounded-lg text-left transition-colors ${
                          openMenus.has(item.id)
                            ? "bg-green_starbuck/10 text-green_starbuck"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div
                          className={`flex items-center ${
                            isOpen ? "space-x-3" : "justify-center"
                          }`}
                        >
                          {item.icon && <item.icon className="w-5 h-5" />}
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

                      {/* Hiển thị submenu khi mở */}
                      {isOpen && openMenus.has(item.id) && (
                        <div className="mt-2 space-y-1 ml-8">
                          {item.children.map((child, index) => (
                            <NavLink
                              key={index}
                              to={child.path}
                              className={({ isActive }) =>
                                `block p-2 rounded-lg text-sm transition-colors ${
                                  isActive
                                    ? "bg-green_starbuck text-white"
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
                        `w-full flex items-center ${
                          isOpen ? "justify-between" : "justify-center"
                        } p-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-green_starbuck text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      <div
                        className={`flex items-center ${
                          isOpen ? "space-x-3" : "justify-center"
                        }`}
                      >
                        {item.icon && <item.icon className="w-5 h-5" />}
                        {isOpen && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </div>
                    </NavLink>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                {isOpen ? "Không có menu nào" : "🚫"}
              </div>
            )}
          </nav>

          {/* Khu vực footer (đăng xuất) */}
          <div className="p-4 border-t border-gray-200">
            {onLogout && (
              <button
                onClick={onLogout}
                className={`w-full flex items-center ${
                  isOpen ? "justify-between" : "justify-center"
                } p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}
              >
                <div
                  className={`flex items-center ${
                    isOpen ? "space-x-3" : "justify-center"
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  {isOpen && <span className="font-medium">Đăng xuất</span>}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nút mở/đóng sidebar trên di động */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 lg:hidden"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>
    </>
  );
}
