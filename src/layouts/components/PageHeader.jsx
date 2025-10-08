import React from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { navSchema } from "./nav/nav.schema";

const PageHeader = ({
  icon: IconProp,
  title: TitleProp,
  rightContent,
  className = "",
}) => {
  const location = useLocation();

  //! Hàm để tìm nav item dựa trên path hiện tại
  const findNavItemByPath = (currentPath) => {
    // Loại bỏ prefix "/store-manager" hoặc "/admin" để match với nav.schema
    const cleanPath =
      currentPath.replace(/^\/(store-manager|admin)/, "") || "/";

    // Tìm trong nav items chính
    for (const item of navSchema) {
      // Check exact path match
      if (item.path === cleanPath) {
        return { title: item.title, icon: item.icon };
      }

      // Check children nếu có
      if (item.children) {
        for (const child of item.children) {
          if (child.path === cleanPath) {
            return { title: child.title, icon: item.icon }; // Dùng icon của parent
          }
        }
      }

      // Check partial match (cho dynamic routes)
      if (item.path && cleanPath.startsWith(item.path) && item.path !== "/") {
        return { title: item.title, icon: item.icon };
      }
    }

    return null;
  };

  // Lấy thông tin từ schema hoặc dùng props
  const navItem = findNavItemByPath(location.pathname);
  const finalIcon = IconProp || navItem?.icon;
  const finalTitle = TitleProp || navItem?.title || "Trang";

  return (
    <div
      className={`bg-green_starbuck/80 text-white px-5 py-4 shadow-md -mt-6 -mx-6 mb-6 ${className}`}
    >
      <div className="max-w-[110rem] mx-auto flex">
        <div className="flex items-center gap-3 flex-1 pl-3">
          {finalIcon &&
            React.createElement(finalIcon, { className: "w-5 h-5" })}
          <h1 className="text-md font-montserrat font-semibold capitalize tracking-tight pb-1 border-b-2 border-camel inline-block">
            {finalTitle !== "Dashboard" ? "Quản lý" : ""} {finalTitle}
          </h1>
        </div>

        {/* Right content - buttons, breadcrumb, etc. */}
        {rightContent && (
          <div className="flex items-center gap-3 pr-3">{rightContent}</div>
        )}
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  icon: PropTypes.elementType, // Icon component từ lucide-react (optional - override schema)
  title: PropTypes.string, // Text tiêu đề (optional - override schema)
  rightContent: PropTypes.node, // JSX elements bên phải (buttons, breadcrumb, etc.)
  className: PropTypes.string, // Class CSS bổ sung (optional)
};

export default PageHeader;
