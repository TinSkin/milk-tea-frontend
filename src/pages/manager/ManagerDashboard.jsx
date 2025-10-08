import React from 'react';
import { BarChart3, Store, MapPin, Package, ShoppingCart, Users, Tag } from "lucide-react";
import { useStoreSelectionStore } from "../../store/storeSelectionStore";

const ManagerDashboard = () => {
  const { selectedStore } = useStoreSelectionStore();

  // Demo data
  const stats = [
    {
      title: "Tổng sản phẩm",
      value: "45",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Đơn hàng hôm nay",
      value: "23",
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "Khách hàng",
      value: "156",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Danh mục",
      value: "8",
      icon: Tag,
      color: "bg-orange-500",
    },
  ];

  return (
    <>
      {/* Thông tin cửa hàng */}
      {selectedStore && (
        <div className="bg-green_starbuck/80 text-white px-5 py-4 shadow-md -mt-6 -mx-6 mb-6">
          <div className="max-w-[110rem] mx-auto flex">
            {/* Title */}
            <div className="flex items-center gap-3 flex-1 pl-3">
              <BarChart3 className="w-5 h-5" />
              <h1 className="text-md font-montserrat font-semibold capitalize tracking-tight pb-1 border-b-2 border-camel inline-block">
                Dashboard
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Welcome Message */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Chào mừng đến với Dashboard Store Manager
            </h2>
            <p className="text-gray-600 mb-4">
              Đây là trang tổng quan quản lý cửa hàng của bạn. Từ đây bạn có thể:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Quản lý sản phẩm và danh mục</li>
              <li>Theo dõi đơn hàng và khách hàng</li>
              <li>Quản lý topping và các tính năng khác</li>
              <li>Xem báo cáo và thống kê</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;