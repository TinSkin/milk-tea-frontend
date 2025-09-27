// Import hook useNavigate từ react-router-dom để điều hướng trang
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import motion từ framer-motion để tạo hiệu ứng chuyển động

// Import hook useEffect và useState từ React để quản lý trạng thái và side-effect
import { useEffect, useState, useRef } from "react";

// Import các icon Pencil, Eye, Trash2 từ thư viện lucide-react để dùng trong giao diện
import { Eye, UserRound, Users, UserCheck, UserX, Search } from "lucide-react";

// Import hàm fetchProducts và store để lấy danh sách sản phẩm từ server
import { useUserStore } from "../../store/userStore";
import { useAuthStore } from "../../store/authStore";

// Import component
import Header from "../../components/Admin/Header";
import Notification from "../../components/Notification";
import ViewUserModal from "../../components/Admin/ViewUserModal";

const AdminAccount = () => {
  const navigate = useNavigate();
  const isInitLoaded = useRef(false);

  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
  });

  //! User store
  const { users, isLoading, pagination, getAllUsers, clearError } =
    useUserStore();
  //! Auth store
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  // Filter states: Search, sort, status
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái searchTerm: Lưu từ khóa tìm kiếm theo tên sản phẩm
  const [statusFilter, setStatusFilter] = useState("all"); // Trạng thái statusFilter: Lưu trạng thái lọc (all, available, unavailable)
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(5); // Trạng thái itemsPerPage: Số người dùng hiển thị

  //! Handle loadUsers: Lấy danh sách người dùng từ server
  const loadUsersInit = async (page = 1, limit = itemsPerPage) => {
    try {
      clearError();
      const params = {
        page,
        limit,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
        isVerified: verifiedFilter,
        sortBy,
        sortOrder,
      };
      const result = await getAllUsers(params);
      setStats(
        result.stats || {
          totalCustomers: 0,
          activeCustomers: 0,
          inactiveCustomers: 0,
        }
      );
      if (result && result.users) {
        Notification.success(
          `Tải thành công ${result.users.length} tài khoản.`
        );
      }
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách tài khoản",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };
  const loadUsers = async (page = 1, limit = itemsPerPage) => {
    try {
      //* Clear any previous errors
      clearError();

      const params = {
        page,
        limit,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
        isVerified: verifiedFilter,
        sortBy,
        sortOrder,
      };

      const result = await getAllUsers(params); // Gọi API để lấy danh sách sản phẩm
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách tài khoản",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };

  //! Handle view user
  const handleViewUser = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  //! Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadUsers(1); // Reset to page 1 when searching
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, verifiedFilter, statusFilter, roleFilter, sortBy, sortOrder]); // Chạy lại khi các trạng thái này thay đổi

  //! Handle pagination
  const handlePageChange = (newPage) => {
    loadUsers(newPage);
  };

  //!  Checking log in & loading users
  useEffect(() => {
    // Wait for auth check to complete
    if (isCheckingAuth) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    // Load initial data
    if (!isInitLoaded.current) {
      isInitLoaded.current = true;
      loadUsersInit(1);
    } // Gọi hàm loadUsers để tải danh sách tài khoản (Gọi 1 lần)
  }, [isCheckingAuth, isAuthenticated, user, navigate]); // Chạy lại khi navigate thay đổi

  //! Loading state
  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải người dùng...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="font-roboto max-w-full mx-auto mt-10 p-6 bg-white rounded shadow">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 bg-camel/10 rounded-lg py-4 px-6">
          <UserRound className="w-8 h-8 text-camel" strokeWidth={2} />
          <h1 className="font-montserrat text-2xl font-semibold text-dark_blue capitalize tracking-tight pb-2 border-b-2 border-camel inline-bloc">
            Quản lý tài khoản
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 border border-blue-200"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-200 rounded-full shadow">
                <Users className="w-7 h-7 text-blue-700" />
              </div>
              <div className="ml-4">
                <p className="text-base font-semibold text-blue-700">
                  Tổng khách hàng
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats?.totalCustomers?.toLocaleString() ?? 0}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  Tất cả tài khoản đã đăng ký
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow p-6 border border-green-200"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-200 rounded-full shadow">
                <UserCheck className="w-7 h-7 text-green-700" />
              </div>
              <div className="ml-4">
                <p className="text-base font-semibold text-green-700">
                  Đang hoạt động
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {stats?.activeCustomers?.toLocaleString() ?? 0}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Tài khoản đang sử dụng
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow p-6 border border-red-200"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-200 rounded-full shadow">
                <UserX className="w-7 h-7 text-red-700" />
              </div>
              <div className="ml-4">
                <p className="text-base font-semibold text-red-700">
                  Không hoạt động
                </p>
                <p className="text-3xl font-bold text-red-900">
                  {stats?.inactiveCustomers?.toLocaleString() ?? 0}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Tài khoản đã bị khóa/ngừng
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Container chính */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex gap-4 flex-wrap">
            {/* Nhóm các bộ lọc và sắp xếp */}
            {/* Ô tìm kiếm */}
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {/* Dropdown lọc verified  */}
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Xác minh</option>
              <option
                value="true"
                className="bg-orange-100 text-orange-600 font-semibold"
              >
                Đã xác minh
              </option>
              <option
                value="false"
                className="bg-blue-100 text-blue-700 font-semibold"
              >
                Chưa xác minh
              </option>
            </select>
            {/* Dropdown lọc trạng thái */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all" className="font-sans font-semibold">
                Trạng thái
              </option>
              <option
                value="active"
                className="bg-green-100 text-green-700 font-sans font-semibold"
              >
                Hoạt động
              </option>
              <option
                value="inactive"
                className="bg-gray-100 text-gray-700 font-sans font-semibold"
              >
                Không hoạt động
              </option>
            </select>
            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all" className="font-semibold">
                Vai trò
              </option>
              <option
                value="user"
                className="bg-gray-100 text-gray-700 font-semibold"
              >
                User
              </option>
              <option
                value="admin"
                className="bg-red-100 text-red-700 font-semibold"
              >
                Admin
              </option>
              <option
                value="manager"
                className="bg-blue-100 text-blue-700 font-semibold"
              >
                Manager
              </option>
            </select>
            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="userName-asc">Tên A-Z</option>
              <option value="userName-desc">Tên Z-A</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
            </select>
            {/* Dropdown chọn số sản phẩm mỗi trang */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const newLimit = parseInt(e.target.value);
                setItemsPerPage(newLimit);

                // Gọi API với limit mới và reset về trang 1
                loadUsers(1, newLimit);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">5 người dùng / trang</option>
              <option value="10">10 người dùng / trang</option>
              <option value="15">15 người dùng / trang</option>
            </select>
          </div>
        </div>

        {/* Users table */}
        <div className="overflow-x-auto rounded-md">
          {/* Container bảng, hỗ trợ cuộn ngang nếu bảng quá rộng */}
          {users.length === 0 ? (
            <p className="text-center text-gray-600 text-lg py-8">
              {searchTerm
                ? "Không tìm thấy người dùng nào"
                : "Chưa có người dùng"}
            </p>
          ) : (
            <table className="min-w-full border-2 divide-y divide-gray-200">
              {/* Bảng hiển thị sản phẩm */}
              <thead className="bg-green_starbuck">
                {/* Phần tiêu đề bảng */}
                <tr className="text-center">
                  <th className="p-3 text-lg font-semibold text-white !text-left">
                    Tên đăng nhập
                  </th>
                  <th className="p-3 text-lg font-semibold text-white !text-left">
                    Email
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Số điện thoại
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Vai trò
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Xác minh
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Trạng thái
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Phần thân bảng */}
                {users.map(
                  (
                    user // Duyệt qua danh sách sản phẩm hiển thị
                  ) => (
                    <tr key={user._id} className="hover:bg-gray-50 text-center">
                      {/* USERNAME ACCOUNT */}
                      <td className="p-3 text-dark_blue font-semibold text-left">
                        {user.userName || "-"}
                      </td>
                      {/* EMAIL */}
                      <td className="p-3 text-lg text-gray-900 text-left">
                        {user.email || "N/A"} {/* Hiển thị email account */}
                      </td>
                      {/* PHONE NUMBER */}
                      <td className="p-3 text-lg text-dark_blue">
                        {user.phoneNumber || "N/A"}
                      </td>
                      {/* ROLE */}
                      <td className="p-3 text-lg text-dark_blue">
                        <span
                          className={`px-2 py-1 rounded text-sm font-semibold ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : user.role === "manager"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      {/* VERIFY */}
                      <td className="p-3 text-lg text-dark_blue">
                        <span
                          className={`px-2 py-1 rounded text-sm font-semibold ${
                            user.isVerified === true
                              ? "bg-orange-100 text-orange-600"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                        </span>
                      </td>
                      {/* STATUS */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-sm rounded font-semibold ${
                            user.status === "active"
                              ? "text-green-700 bg-green-100"
                              : "text-gray-600 bg-gray-100"
                          }`}
                        >
                          {user.status === "active"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </span>
                      </td>
                      {/* ACTION */}
                      <td className="p-3">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && ( // Hiển thị phân trang nếu có sản phẩm
        <div className="flex justify-between items-center mx-auto max-w-full p-6">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage || isLoading}
            className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
          >
            Trang trước
          </button>
          <div className="flex gap-2">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const pageNum = pagination.currentPage - 2 + i;
                if (pageNum > 0 && pageNum <= pagination.totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className={`px-3 py-1 rounded font-semibold ${
                        pagination.currentPage === pageNum
                          ? "bg-green_starbuck text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              }
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Results info */}
            <div className="mb-4 text-sm text-gray-600 font-semibold flex items-center">
              Hiển thị {users.length} / {pagination.totalUsers} người dùng
              (Trang {pagination.currentPage} / {pagination.totalPages})
            </div>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
      {showViewModal && viewingUser && (
        <ViewUserModal
          user={viewingUser}
          onClose={() => {
            setShowViewModal(false);
            setViewingUser(null);
          }}
        />
      )}
    </>
  );
};

export default AdminAccount;
