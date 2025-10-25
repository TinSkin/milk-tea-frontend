import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

// Import img
import logo from "../../img/logo.png";
import { Trash } from "lucide-react";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, isCheckingAuth } = useAuthStore();
  const [openMenu, setOpenMenu] = useState(false);

  // Cart state và logic
  const { items: cartItems, clearCart } = useCartStore();
  const [cartCount, setCartCount] = useState(0);

  //! Tính tổng số sản phẩm trong giỏ hàng - tự động cập nhật khi cartItems thay đổi
  useEffect(() => {
    const totalCount = cartItems.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    );
    setCartCount(totalCount);
  }, [cartItems]);

  //! Function để clear cart nhanh (development only)
  const debugClearCart = () => {
    clearCart();
    // console.log("DEBUG: Cart cleared completely!");
  };

  //! 🚨 DEBUG: Expose clear function to global window (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      window.debugClearCart = debugClearCart;
      // console.log("DEBUG: Use window.debugClearCart() to clear cart quickly!");
    }

    return () => {
      if (window.debugClearCart) {
        delete window.debugClearCart;
      }
    };
  }, [clearCart]);

  useEffect(() => {
    setOpenMenu(false);
  }, [location.pathname]);

  //! Xử lí nút đăng nhập
  const handleLoginClick = () => {
    navigate("/login");
  };

  //! Xử lí nút đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  //! Nếu chưa xác thực xong, hiển thị loading
  if (isCheckingAuth) {
    return (
      <header className="bg-[#25344f] shadow-md py-4 px-6 sticky top-0 z-50 border-b-8 border-camel">
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
    <header className="bg-[#0c1321] shadow-md py-4 px-6 sticky top-0 z-50 border-b-8 border-camel">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <Link
          to={"/"}
          className="font-bold text-[#f8d794] text-lg focus:outline-none"
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

          {/* Cart Icon & User Authentication Area */}
          <div className="flex items-center gap-4">
            {/* Chỉ hiển thị giỏ hàng khi user đã đăng nhập */}
            {user && (
              <>
                {/* Cart Button */}
                <Link
                  to="/cart"
                  className="relative p-2 text-white hover:text-camel transition-colors duration-200"
                  title="Giỏ hàng"
                >
                  {/* Cart Icon SVG */}
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 9M7 13l-1.5-9M16 19a2 2 0 100 4 2 2 0 000-4zM9 19a2 2 0 100 4 2 2 0 000-4z"
                    />
                  </svg>

                  {/* Badge hiển thị số lượng sản phẩm */}
                  {cartCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                      {/* Pulse hiệu ứng khi có sản phẩm */}
                      <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 animate-ping opacity-20"></span>
                    </>
                  )}
                </Link>

                {/* Nút Clear Cart (chỉ hiển thị trong môi trường development) */}
                {/* {cartCount > 0 && process.env.NODE_ENV === "development" && (
                  <button
                    onClick={debugClearCart}
                    className="ml-2 p-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    title="DEBUG: Clear Cart"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )} */}
              </>
            )}

            {/* Khu vực Đăng nhập / Avatar */}
            {user ? (
              <div className="relative">
                <div className="flex items-center">
                  {/* Avatar */}
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

                  {/* Tên và email */}
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
                  <div className="px-4 py-3 text-md text-dark_blue">
                    <div className="font-semibold">{user.userName}</div>
                    <div className="font-medium truncate text-camel">
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <Link
                      to="/order-history"
                      className="block w-full bg-camel text-white px-4 py-2 hover:bg-logo_color transition font-semibold text-center"
                    >
                      Lịch sử đơn hàng
                    </Link>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full bg-camel text-white px-4 py-2 hover:bg-logo_color transition font-semibold"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="bg-[#D5BB93] text-[#6F4D38] px-4 py-2 rounded hover:bg-logo_color transition font-semibold"
                onClick={handleLoginClick}
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
