// Import các hook useEffect, useState từ React để quản lý trạng thái và side-effect
import { useEffect, useState, useRef } from "react";

// Import motion từ framer-motion để tạo hiệu ứng chuyển động
import { motion } from "framer-motion";

// Import Select component từ react-select để tạo dropdown đẹp
import Select from "react-select";

// Import các icon Pencil, Eye, Trash2 từ thư viện lucide-react để dùng trong giao diện
import {
  Eye,
  UserRound,
  Users,
  UserCheck,
  UserX,
  Search,
  Settings,
  Shield,
  Store,
  Lock,
  Unlock,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Ban,
  SortDesc,
  SortAsc,
  ListOrdered,
  CheckSquare,
  Square,
} from "lucide-react";

// Import stores để quản lý trạng thái
import { useUserStore } from "../../store/userStore";

// Import component
import Notification from "../../components/ui/Notification";
import ViewUserModal from "../../components/features/ecommerce/accounts/ViewUserModal";

// Import utilities và hooks
import { useTableCheckbox } from "../../utils/hooks/useCheckboxSelection";

// Tùy chọn sắp xếp
const sortOptions = [
  {
    value: "createdAt-desc",
    label: (
      <span className="flex items-center gap-2">
        <SortDesc className="w-4 h-4 text-blue-600" />
        Mới nhất
      </span>
    ),
  },
  {
    value: "createdAt-asc",
    label: (
      <span className="flex items-center gap-2">
        <SortAsc className="w-4 h-4 text-blue-600" />
        Cũ nhất
      </span>
    ),
  },
  {
    value: "userName-asc",
    label: (
      <span className="flex items-center gap-2">
        <SortAsc className="w-4 h-4 text-green-600" />
        Tên A-Z
      </span>
    ),
  },
  {
    value: "userName-desc",
    label: (
      <span className="flex items-center gap-2">
        <SortDesc className="w-4 h-4 text-green-600" />
        Tên Z-A
      </span>
    ),
  },
  {
    value: "email-asc",
    label: (
      <span className="flex items-center gap-2">
        <SortAsc className="w-4 h-4 text-orange-600" />
        Email A-Z
      </span>
    ),
  },
  {
    value: "email-desc",
    label: (
      <span className="flex items-center gap-2">
        <SortDesc className="w-4 h-4 text-orange-600" />
        Email Z-A
      </span>
    ),
  },
];

// Tùy chọn trạng thái
const statusOptions = [
  {
    value: "all",
    label: (
      <span className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-600" />
        Tất cả trạng thái
      </span>
    ),
  },
  {
    value: "active",
    label: (
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        Hoạt động
      </span>
    ),
  },
  {
    value: "inactive",
    label: (
      <span className="flex items-center gap-2">
        <Ban className="w-4 h-4 text-red-600" />
        Không hoạt động
      </span>
    ),
  },
];

// Tùy chọn vai trò
const roleOptions = [
  {
    value: "all",
    label: (
      <span className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-gray-600" />
        Tất cả vai trò
      </span>
    ),
  },
  {
    value: "customer",
    label: (
      <span className="flex items-center gap-2">
        <UserRound className="w-4 h-4 text-green-600" />
        Customer
      </span>
    ),
  },
  {
    value: "staff",
    label: (
      <span className="flex items-center gap-2">
        <Users className="w-4 h-4 text-yellow-600" />
        Staff
      </span>
    ),
  },
  {
    value: "storeManager",
    label: (
      <span className="flex items-center gap-2">
        <Store className="w-4 h-4 text-blue-600" />
        Store Manager
      </span>
    ),
  },
  {
    value: "admin",
    label: (
      <span className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-red-600" />
        Admin
      </span>
    ),
  },
];

// Tùy chọn xác minh
const verifiedOptions = [
  {
    value: "all",
    label: (
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-gray-600" />
        Tất cả xác minh
      </span>
    ),
  },
  {
    value: "true",
    label: (
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-orange-600" />
        Đã xác minh
      </span>
    ),
  },
  {
    value: "false",
    label: (
      <span className="flex items-center gap-2">
        <Ban className="w-4 h-4 text-blue-600" />
        Chưa xác minh
      </span>
    ),
  },
];

// Số mục hiển thị trên mỗi trang
const itemsPerPageOptions = [
  {
    value: 5,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />5 / Trang
      </span>
    ),
  },
  {
    value: 10,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />
        10 / Trang
      </span>
    ),
  },
  {
    value: 15,
    label: (
      <span className="flex items-center gap-2">
        <ListOrdered className="w-4 h-4 text-camel" />
        15 / Trang
      </span>
    ),
  },
];

const AdminAccount = () => {
  const isInitLoaded = useRef(false);

  // Store quản lý tài khoản
  const { users, isLoading, pagination, getAllUsers, clearError } =
    useUserStore();

  // Trạng thái xem thông tin user modal
  const [viewingUser, setViewingUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  //! Xử lý xem chi tiết người dùng
  const handleViewUser = (user) => {
    console.log("user to view:", user.role);
    setViewingUser(user);
    setShowViewModal(true);
  };

  //! Xử lý thay đổi vai trò người dùng
  const handleToggleRole = async (user) => {
    try {
      // Logic thay đổi role: customer -> staff -> storeManager -> admin -> customer
      let newRole;
      switch (user.role) {
        case "customer":
          newRole = "staff";
          break;
        case "staff":
          newRole = "storeManager";
          break;
        case "storeManager":
          newRole = "admin";
          break;
        case "admin":
          newRole = "customer";
          break;
        default:
          newRole = "customer";
      }

      // TODO: Call API to update user role
      // await updateUserRole(user._id, newRole);
      const roleNames = {
        customer: "Customer",
        staff: "Staff",
        storeManager: "Store Manager",
        admin: "Admin",
      };
      Notification.success(
        `Đã cập nhật vai trò của ${user.userName} thành ${roleNames[newRole]}`
      );
      loadUsers(pagination.currentPage);
    } catch (error) {
      Notification.error("Cập nhật vai trò thất bại", error.message);
    }
  };

  //! Xử lý khóa/mở khóa tài khoản
  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === "active" ? "inactive" : "active";
      const action = newStatus === "active" ? "mở khóa" : "khóa";

      // TODO: Call API to update user status
      // await updateUserStatus(user._id, newStatus);
      Notification.success(`Đã ${action} tài khoản ${user.userName}`);
      loadUsers(pagination.currentPage);
    } catch (error) {
      Notification.error("Cập nhật trạng thái thất bại", error.message);
    }
  };

  //! Xử lý reset mật khẩu
  const handleResetPassword = async (user) => {
    try {
      // TODO: Call API to reset password
      // await resetUserPassword(user._id);
      Notification.success(`Đã gửi email reset mật khẩu cho ${user.userName}`);
    } catch (error) {
      Notification.error("Reset mật khẩu thất bại", error.message);
    }
  };

  //! Xử lý xóa tài khoản
  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản "${user.userName}"?\n\nHành động này KHÔNG THỂ hoàn tác!`
    );

    if (confirmDelete) {
      try {
        // TODO: Call API to delete user
        // await deleteUser(user._id);
        Notification.success(`Đã xóa tài khoản ${user.userName}`);
        loadUsers(pagination.currentPage);
      } catch (error) {
        Notification.error("Xóa tài khoản thất bại", error.message);
      }
    }
  };

  // Trạng thái lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [verifiedFilter, setVerifiedFilter] = useState("all");

  // Trạng thái thống kê
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
  });

  // Phân trang
  const [itemsPerPage, setItemsPerPage] = useState(5);

  //! Tải danh sách người dùng cho lần đầu (có notification)
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

  //! Tải danh sách người dùng cho search/filter/pagination (không notification)
  const loadUsers = async (page = 1, limit = itemsPerPage) => {
    try {
      //* Xóa lỗi trước đó (nếu có)
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

      const result = await getAllUsers(params); // Gọi API để lấy danh sách người dùng
      const fetchStats = result.stats || {
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
      };
      setStats(fetchStats);
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách tài khoản",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
    }
  };

  //! Xử lý tìm kiếm với debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Trở về trang 1 khi tìm kiếm
      loadUsers(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, verifiedFilter, statusFilter, roleFilter, sortBy, sortOrder]); // Chạy lại khi các trạng thái này thay đổi

  //! Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    loadUsers(newPage);
  };

  const nextPage = () => {
    if (pagination.hasNextPage) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrevPage) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

  // Checkbox selection hook
  const {
    selectedItems,
    selectedCount,
    hasSelection,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    isItemSelected,
    isAllSelected,
    getSelectedItems,
  } = useTableCheckbox(users, "_id");

  //! Tải dữ liệu ban đầu khi component mount
  useEffect(() => {
    // Gọi hàm loadUsersInit để tải danh sách tài khoản (gọi 1 lần và sẽ không gọi lại)
    if (!isInitLoaded.current) {
      isInitLoaded.current = true;
      loadUsersInit(1);
    }
  }, []); // Chạy lại khi navigate thay đổi

  return (
    <>
      {/* Content chính */}
      <div className="px-5 pt-4 pb-6">
        <div className="font-roboto max-w-[110rem] mx-auto mt-10 bg-white rounded-lg shadow border-2">
          {/* Title & Nút tác vụ */}
          <div className="flex flex-col justify-between gap-5 border-b-2 border-gray-200 px-5 py-4 sm:flex-row sm:items-center my-4">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Danh sách tài khoản
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Quản lý tài khoản người dùng trong hệ thống.
              </p>
            </div>
          </div>

          {/* Thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-5">
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
                    Tổng tài khoản
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

          {/* Thanh tìm kiếm & sắp xếp & lọc */}
          <div className="border-b-2 border-gray-200 px-5 py-4">
            <div className="flex gap-3 sm:justify-between">
              {/* Tìm kiếm & Sắp xếp */}
              <div className="flex gap-3">
                {/* Tìm kiếm */}
                <div className="relative flex-1 sm:flex-auto">
                  <input
                    type="text"
                    placeholder="Tìm kiếm tên người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {/* Lọc theo xác minh */}
                <Select
                  options={verifiedOptions}
                  value={verifiedOptions.find(
                    (opt) => opt.value === verifiedFilter
                  )}
                  onChange={(opt) => setVerifiedFilter(opt.value)}
                  placeholder="Chọn xác minh..."
                  className="min-w-[180px] z-10"
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "2px 0",
                      borderRadius: "0.5rem",
                      borderColor: "#d1d5db",
                      boxShadow: "none",
                      minHeight: "40px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#f0fdf4"
                        : state.isFocused
                        ? "#f3f4f6"
                        : "white",
                      color: "inherit",
                      fontWeight: state.isSelected ? "bold" : "normal",
                      fontSize: "1rem",
                    }),
                  }}
                />
                {/* Lọc theo trạng thái */}
                <Select
                  options={statusOptions}
                  value={statusOptions.find(
                    (opt) => opt.value === statusFilter
                  )}
                  onChange={(opt) => setStatusFilter(opt.value)}
                  placeholder="Chọn trạng thái..."
                  className="min-w-[180px] z-10"
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "2px 0",
                      borderRadius: "0.5rem",
                      borderColor: "#d1d5db",
                      boxShadow: "none",
                      minHeight: "40px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#f0fdf4"
                        : state.isFocused
                        ? "#f3f4f6"
                        : "white",
                      color: "inherit",
                      fontWeight: state.isSelected ? "bold" : "normal",
                      fontSize: "1rem",
                    }),
                  }}
                />
                {/* Lọc theo vai trò */}
                <Select
                  options={roleOptions}
                  value={roleOptions.find((opt) => opt.value === roleFilter)}
                  onChange={(opt) => setRoleFilter(opt.value)}
                  placeholder="Chọn vai trò..."
                  className="min-w-[180px] z-10"
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "2px 0",
                      borderRadius: "0.5rem",
                      borderColor: "#d1d5db",
                      boxShadow: "none",
                      minHeight: "40px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#f0fdf4"
                        : state.isFocused
                        ? "#f3f4f6"
                        : "white",
                      color: "inherit",
                      fontWeight: state.isSelected ? "bold" : "normal",
                      fontSize: "1rem",
                    }),
                  }}
                />
                {/* Sắp xếp */}
                <Select
                  options={sortOptions}
                  value={sortOptions.find(
                    (opt) => opt.value === `${sortBy}-${sortOrder}`
                  )}
                  onChange={(opt) => {
                    const [field, order] = opt.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  placeholder="Chọn cách sắp xếp..."
                  className="min-w-[180px] z-10"
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "2px 0",
                      borderRadius: "0.5rem",
                      borderColor: "#d1d5db",
                      boxShadow: "none",
                      minHeight: "40px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#f0fdf4"
                        : state.isFocused
                        ? "#f3f4f6"
                        : "white",
                      color: "inherit",
                      fontWeight: state.isSelected ? "bold" : "normal",
                      fontSize: "1rem",
                    }),
                  }}
                />
              </div>

              {/* Phân trang */}
              <div className="flex gap-3">
                <Select
                  options={itemsPerPageOptions}
                  defaultValue={itemsPerPageOptions[0]} // Mặc định là 5 người dùng một trang
                  value={itemsPerPageOptions.find(
                    (opt) => opt.value === itemsPerPage
                  )}
                  onChange={(opt) => {
                    setItemsPerPage(opt.value);
                    loadUsers(1, opt.value); // Load page 1 với limit mới
                  }}
                  placeholder="Chọn số lượng..."
                  className="min-w-[180px] z-10"
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "2px 0",
                      borderRadius: "0.5rem",
                      borderColor: "#d1d5db",
                      boxShadow: "none",
                      minHeight: "40px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#f0fdf4"
                        : state.isFocused
                        ? "#f3f4f6"
                        : "white",
                      color: "inherit",
                      fontWeight: state.isSelected ? "bold" : "normal",
                      fontSize: "1rem",
                    }),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Trạng thái tải */}
          {isLoading && users.length === 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center">
                <svg
                  className="animate-spin h-6 w-6 mr-3 text-green_starbuck"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Đang tải người dùng...
              </div>
            </div>
          )}

          {/* Bảng tài khoản */}
          <div className="overflow-x-auto">
            {/* Container bảng, hỗ trợ cuộn ngang nếu bảng quá rộng */}
            {users.length === 0 && !isLoading ? (
              <p className="text-center text-gray-600 text-lg py-8">
                {searchTerm
                  ? "Không tìm thấy người dùng nào"
                  : "Chưa có người dùng"}
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                {/* Bảng hiển thị người dùng */}
                <thead>
                  {/* Phần tiêu đề bảng */}
                  <tr className="border-b-2 border-gray-200">
                    <th className="w-12 px-3 py-4 text-left">
                      {/* Chọn tất cả */}
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAllSelected()}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-green_starbuck focus:ring-green_starbuck"
                        />
                      </label>
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Tên đăng nhập
                    </th>
                    <th className="p-3 text-md text-start font-semibold text-green_starbuck">
                      Email
                    </th>
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      Số điện thoại
                    </th>
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      Vai trò
                    </th>
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      Xác minh
                    </th>
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      Trạng thái
                    </th>
                    <th className="p-3 text-md font-semibold text-green_starbuck">
                      <div className="flex items-center justify-center">
                        <Settings className="w-6 h-6" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 border-b-2 border-gray-200">
                  {/* Phần thân bảng */}
                  {users.map(
                    (
                      user // Duyệt qua danh sách sản phẩm hiển thị
                    ) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 text-center"
                      >
                        {/* Hiển thị tickbox từng topping */}
                        <td className="p-3">
                          <button
                            onClick={() => toggleSelectItem(user._id)}
                            className="flex items-center justify-center w-full"
                          >
                            {isItemSelected(user._id) ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>

                        {/* Hiển thị tên tài khoản */}
                        <td className="p-3 text-sm text-dark_blue font-semibold text-left">
                          {user.userName || "-"}
                        </td>
                        {/* Hiển thị email */}
                        <td className="p-3 text-md text-gray-900 text-left">
                          {user.email || "-"}
                        </td>
                        {/* Hiển thị số điện thoại */}
                        <td className="p-3 text-md text-dark_blue">
                          {user.phoneNumber || "-"}
                        </td>
                        {/* Hiển thị vai trò */}
                        <td className="p-3 text-md text-dark_blue">
                          <span
                            className={`px-2 py-1 rounded text-sm font-semibold ${
                              user.role === "admin"
                                ? "bg-red-100 text-red-700"
                                : user.role === "storeManager"
                                ? "bg-blue-100 text-blue-700"
                                : user.role === "staff"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700" // customer
                            }`}
                          >
                            {user.role === "storeManager"
                              ? "Store Manager"
                              : user.role === "admin"
                              ? "Admin"
                              : user.role === "staff"
                              ? "Staff"
                              : "Customer"}
                          </span>
                        </td>
                        {/* Hiển thị xác minh tài khoản */}
                        <td className="p-3 text-md text-dark_blue">
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
                        {/* Hiển thị trạng thái tài khoản */}
                        <td className="p-3 min-w-[140px]">
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
                        {/* Hiển thị thao tác */}
                        <td className="p-3">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleToggleRole(user)}
                              className="text-purple-600 hover:text-purple-800"
                              title="Thay đổi vai trò"
                            >
                              <Shield className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`${
                                user.status === "active"
                                  ? "text-red-600 hover:text-red-800"
                                  : "text-green-600 hover:text-green-800"
                              }`}
                              title={
                                user.status === "active"
                                  ? "Khóa tài khoản"
                                  : "Mở khóa tài khoản"
                              }
                            >
                              {user.status === "active" ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleResetPassword(user)}
                              className="text-orange-600 hover:text-orange-800"
                              title="Reset mật khẩu"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-800"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Phân trang */}
          {pagination.totalPages > 1 && ( // Hiển thị phân trang nếu có sản phẩm
            <div className="flex justify-between items-center mt-4 flex-col border-t border-gray-200 px-5 py-4 sm:flex-row">
              <button
                onClick={prevPage}
                disabled={!pagination.hasPrevPage || isLoading}
                className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
              >
                Trang trước
              </button>

              {/* Số trang */}
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

              {/* Thông tin kết quả */}
              <div className="flex items-center gap-4">
                {/* Results info */}
                <div className="mb-4 text-sm text-gray-600 font-semibold flex items-center">
                  Hiển thị {users.length} / {pagination.totalUsers} người dùng
                  (Trang {pagination.currentPage} / {pagination.totalPages})
                </div>
                <button
                  onClick={nextPage}
                  disabled={!pagination.hasNextPage || isLoading}
                  className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal xem thông tin người dùng */}
      {showViewModal && viewingUser && (
        <ViewUserModal
          user={viewingUser}
          viewerRole="admin"
          onClose={() => {
            setShowViewModal(false);
            setViewingUser(null);
          }}
          className=""
        />
      )}
    </>
  );
};

export default AdminAccount;
