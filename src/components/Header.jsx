import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Import img
import logo from "../img/logo.png";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, isCheckingAuth } = useAuthStore();
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    setOpenMenu(false);
  }, [location.pathname]);

  //! Handle login click
  const handleLoginClick = () => {
    navigate("/login");
  };

  //! Handle logout click
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  //! Loading state for checking authentication
  if (isCheckingAuth) {
    return (
      <header className="bg-dark_blue shadow-md py-4 px-6 sticky top-0 z-50 border-b-8 border-camel">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <Link
            to="/"
            className="font-bold text-camel text-lg focus:outline-none"
          >
            <img src={logo} alt="Logo" className="w-full h-[130px]" />
          </Link>
          <div className="text-white">Đang tải...</div>
        </div>
      </header>
    );
  }

  const isActive = (path) =>
    location.pathname === path ? "border-b-2 border-camel" : "hover:text-camel";

  return (
    <header className="bg-dark_blue shadow-md py-4 px-6 sticky top-0 z-50 border-b-8 border-camel">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <Link
          to={"/"}
          className="font-bold text-camel text-lg focus:outline-none"
        >
          <img src={logo} alt="Logo" className="w-full h-[130px]" />
        </Link>
        <div className="flex w-[70%] items-center justify-around">
          <ul className="flex gap-6 text-white font-semibold uppercase">
            {/* Home */}
            <Link
              to={"/"}
              className={`cursor-pointer hover:text-camel border-solid hover:border-b-2 hover:border-camel ${isActive(
                "/"
              )}`}
            >
              Trang chủ
            </Link>
            {/* Introduction */}
            <Link
              to={"/intro"}
              className={`cursor-pointer hover:text-camel border-solid hover:border-b-2 hover:border-camel ${isActive(
                "/intro"
              )}`}
            >
              Giới thiệu
            </Link>
            {/* Menu */}
            <Link
              to={"/menu"}
              className={`cursor-pointer hover:text-camel border-solid hover:border-b-2 hover:border-camel ${isActive(
                "/menu"
              )}`}
            >
              Thực đơn
            </Link>
          </ul>

          {user ? (
            <div className="relative">
              <div className="flex items-center">
                {/* Avatar button */}
                <button
                  type="button"
                  className="text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="user-menu-button"
                  aria-expanded="false"
                  onClick={() => setOpenMenu((o) => !o)}
                >
                  <img
                    className="w-12 h-12 rounded"
                    src="https://flowbite.com/docs/images/people/profile-picture-3.jpg"
                    alt="user"
                  />
                </button>
                {/* Show name and role */}
                <div className="flex flex-col ml-2">
                  <span className="font-semibold text-camel text-base capitalize">
                    {user.userName}
                  </span>
                  <span className="font-medium text-white text-xs lowercase">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Dropdown menu */}
              <div
                id="user-dropdown"
                className={`absolute right-0 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow z-50 ${
                  openMenu ? "" : "hidden"
                }`}
              >
                <div className="px-4 py-3 text-md text-dark_blue ">
                  <div className="font-semibold">{user.userName}</div>
                  <div className="font-medium truncate text-camel">
                    {user.email}
                  </div>
                </div>
                <div className="py-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full bg-camel text-white px-4 py-2 rounded hover:bg-logo_color transition font-semibold"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="bg-camel text-white px-4 py-2 rounded hover:bg-logo_color transition font-semibold"
              onClick={handleLoginClick}
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
