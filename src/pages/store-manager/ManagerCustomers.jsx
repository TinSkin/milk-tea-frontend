import React from 'react';
import { Users, Store, MapPin } from "lucide-react";
import { useStoreSelectionStore } from "../../store/storeSelectionStore";

const ManagerCustomers = () => {
  const { selectedStore } = useStoreSelectionStore();

  return (
    <>
      {/* Thông tin cửa hàng */}
      {selectedStore && (
        <div className="bg-green_starbuck/80 text-white px-5 py-4 shadow-md -mt-6 -mx-6 mb-6">
          <div className="max-w-[110rem] mx-auto flex">
            {/* Title */}
            <div className="flex items-center gap-3 flex-1 pl-3">
              <Users className="w-5 h-5" />
              <h1 className="text-md font-montserrat font-semibold capitalize tracking-tight pb-1 border-b-2 border-camel inline-block">
                Quản lý khách hàng
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quản lý Khách hàng
            </h2>
            <p className="text-gray-600">
              Trang quản lý khách hàng đang được phát triển...
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerCustomers;