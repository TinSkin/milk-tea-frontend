// pages/manager/ManagerDashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Store, 
  MapPin, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Package,
  CreditCard,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Truck
} from "lucide-react";
import { useStoreSelectionStore } from "../../store/storeSelectionStore";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const ManagerDashboard = () => {
  const { selectedStore } = useStoreSelectionStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [notification, setNotification] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  // Hiển thị thông báo
  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!selectedStore) return;
    
    setLoading(true);
    try {
      console.log("Fetching dashboard data for store:", selectedStore._id);
      
      const BASE_URL = import.meta.env.MODE === "development"
      ? import.meta.env.VITE_API_BASE
      : import.meta.env.VITE_API_BASE_PROD;
    
    const apiUrl = `${BASE_URL}/api/stores/my-store/dashboard?period=${timeRange}`;
    
      console.log("🌐 Calling API:", apiUrl);
      
      const response = await fetch(apiUrl, {
        credentials: "include",
      });

      console.log("📡 API Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 Dashboard API response:", data);

      if (data.success) {
        setDashboardData(data.data);
        console.log(" Dashboard data set successfully");
      } else {
        showToast(data.message || "Lỗi khi tải dữ liệu", "error");
      }
    } catch (error) {
      console.error(" Error fetching dashboard data:", error);
      showToast("Không thể tải dữ liệu dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchDashboardData();
    showToast("Đã làm mới dữ liệu");
  };

  // Effects
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, selectedStore]);

  // Format helpers
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("vi-VN").format(number || 0);
  };

  // Status config
  const statusConfig = {
    finding_driver: { label: "Đang tìm tài xế", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    picking_up: { label: "Đang lấy hàng", color: "bg-blue-100 text-blue-800", icon: Truck },
    delivering: { label: "Đang giao hàng", color: "bg-orange-100 text-orange-800", icon: Truck },
    delivered: { label: "Đã giao", color: "bg-green-100 text-green-800", icon: CheckCircle },
    cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800", icon: XCircle }
  };

  // Chart colors
  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  // Stats cards data
  const statsCards = [
    {
      title: "Doanh thu",
      value: dashboardData?.metrics?.totalRevenue || 0,
      format: "currency",
      icon: DollarSign,
      color: "bg-green-500",
      change: dashboardData?.metrics?.revenueGrowth || 0,
    },
    {
      title: "Tổng đơn hàng",
      value: dashboardData?.metrics?.totalOrders || 0,
      format: "number",
      icon: ShoppingCart,
      color: "bg-blue-500",
      change: dashboardData?.metrics?.orderGrowth || 0,
    },
    {
      title: "Khách hàng mới",
      value: dashboardData?.metrics?.newCustomers || 0,
      format: "number",
      icon: Users,
      color: "bg-purple-500",
      change: dashboardData?.metrics?.customerGrowth || 0,
    },
    {
      title: "Sản phẩm bán ra",
      value: dashboardData?.metrics?.productsSold || 0,
      format: "number",
      icon: Package,
      color: "bg-orange-500",
      change: dashboardData?.metrics?.productGrowth || 0,
    },
  ];

  // Format data for charts
  const getChartData = () => {
    const dailyData = dashboardData?.charts?.dailyRevenue || [];
    return dailyData.map(item => ({
      name: `${item._id.day}/${item._id.month}`,
      revenue: item.revenue,
      orders: item.orders
    }));
  };

  const getPieChartData = () => {
    const statusData = dashboardData?.charts?.orderStatusBreakdown || [];
    return statusData.map(item => ({
      name: statusConfig[item._id]?.label || item._id,
      value: item.count,
      revenue: item.revenue
    }));
  };

  // Hàm xuất báo cáo
  const handleExportReport = async (reportType = "overview") => {
    setExporting(true);
    try {
      console.log(" Exporting report:", reportType);
      
      const apiUrl = `/api/stores/my-store/dashboard/export?period=${timeRange}&reportType=${reportType}`;
      
      const response = await fetch(apiUrl, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Export failed with status: ${response.status}`);
      }

      // Tạo blob từ response và tải về
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `bao_cao_${selectedStore.storeCode}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("Xuất báo cáo thành công!");

    } catch (error) {
      console.error(" Error exporting report:", error);
      showToast("Lỗi khi xuất báo cáo", "error");
    } finally {
      setExporting(false);
    }
  };

  if (!selectedStore) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Vui lòng chọn cửa hàng
          </h3>
          <p className="text-gray-600">
            Chọn một cửa hàng để xem dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === "error" ? "bg-red-500" : "bg-green-500"
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Thông tin cửa hàng */}
      {selectedStore && (
        <div className="bg-green_starbuck/80 text-white px-5 py-4 shadow-md -mt-6 -mx-6 mb-6">
          <div className="max-w-[110rem] mx-auto flex">
            {/* Title */}
            <div className="flex items-center gap-3 flex-1 pl-3">
              <BarChart3 className="w-5 h-5" />
              <h1 className="text-md font-montserrat font-semibold capitalize tracking-tight pb-1 border-b-2 border-camel inline-block">
                Dashboard KPI
              </h1>
            </div>

            {/* Empty Space */}
            <div className="flex-1"></div>

            {/* Store Info */}
            <div className="flex items-center gap-3 flex-1 pl-3 justify-end">
              <Store className="w-5 h-5" />
              <div className="pl-2">
                <h3 className="font-semibold">
                  {selectedStore.storeName || selectedStore.name}
                </h3>
                <p className="text-sm opacity-90 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedStore.address &&
                  typeof selectedStore.address === "object"
                    ? `${selectedStore.address.street}, ${selectedStore.address.district}, ${selectedStore.address.city}`
                    : selectedStore.address || "Địa chỉ không có sẵn"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content chính */}
      <div className="px-5 pt-4 pb-6">
        <div className="max-w-[110rem] mx-auto">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Tổng quan hiệu suất
              </h2>
              <p className="text-gray-600 text-sm">
                Theo dõi các chỉ số kinh doanh quan trọng
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="7d">7 ngày</option>
                <option value="30d">30 ngày</option>
                <option value="90d">90 ngày</option>
                <option value="1y">1 năm</option>
              </select>

               {/* Nút Export với dropdown */}
          <div className="relative">
            <button
              onClick={() => handleExportReport("overview")}
              disabled={exporting || loading}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
              {exporting ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
            
            {/* Dropdown cho các loại báo cáo */}
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
              <div className="py-1">
                <button
                  onClick={() => handleExportReport("overview")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  📊 Báo cáo tổng quan
                </button>
                <button
                  onClick={() => handleExportReport("orders")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                   Danh sách đơn hàng
                </button>
                <button
                  onClick={() => handleExportReport("products")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  🏷️ Top sản phẩm
                </button>
                <button
                  onClick={() => handleExportReport("all")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  📑 Tất cả báo cáo
                </button>
              </div>
            </div>
          </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Đang tải...' : 'Làm mới'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.format === "currency" 
                            ? formatCurrency(stat.value)
                            : formatNumber(stat.value)
                          }
                        </p>
                        {stat.change !== undefined && (
                          <div className="flex items-center mt-1">
                            {stat.change >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span
                              className={`text-xs ml-1 ${
                                stat.change >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {Math.abs(stat.change)}%
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              so với kỳ trước
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Section với 2 biểu đồ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Biểu đồ doanh thu theo ngày */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Doanh thu theo ngày
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        labelFormatter={(label) => `Ngày: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.1}
                        name="Doanh thu"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Biểu đồ tròn trạng thái đơn hàng */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Phân bổ trạng thái đơn hàng
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getPieChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [value, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Average Order Value */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Giá trị đơn hàng trung bình
                  </h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatCurrency(dashboardData?.metrics?.averageOrderValue || 0)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Trung bình mỗi đơn hàng
                    </p>
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Sản phẩm đã bán
                  </h3>
                  <div className="space-y-3">
                    {(dashboardData?.metrics?.topProducts || []).slice(0, 5).map((product, index) => (
                      <div key={product._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-3">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {formatNumber(product.quantity)} đã bán
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(product.revenue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Đơn hàng gần đây
                </h3>
                <div className="space-y-4">
                  {(dashboardData?.recentActivities || []).map((order, index) => (
                    <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-4 ${
                          statusConfig[order.status]?.color || 'bg-gray-100 text-gray-600'
                        }`}>
                          {React.createElement(statusConfig[order.status]?.icon || Clock, { className: "w-4 h-4" })}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.customerName} • {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.amount)}
                        </p>
                        <p className={`text-xs ${
                          order.paymentStatus === 'paid' ? 'text-green-600' : 
                          order.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 
                           order.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;