import { useState, useEffect } from "react";
import { X, MapPin, Store, Clock, Phone } from "lucide-react";
import { useStoreSelectionStore } from "../../store/storeSelectionStore";

//! Dữ liệu giả cho thành phố và cửa hàng - sẽ thay thế bằng API sau
const CITIES = [
  { id: "hcm", name: "TP. Hồ Chí Minh" },
  { id: "hanoi", name: "Hà Nội" },
  { id: "danang", name: "Đà Nẵng" },
];

const MOCK_STORES = {
  hcm: [
    {
      _id: "store1",
      name: "Chi nhánh Quận 1",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      phone: "028 1234 5678",
      deliveryTime: "30-45 phút",
      isOpen: true,
      city: "hcm",
    },
    {
      _id: "store2",
      name: "Chi nhánh Quận 3",
      address: "456 Võ Văn Tần, Quận 3, TP.HCM",
      phone: "028 9876 5432",
      deliveryTime: "25-40 phút",
      isOpen: true,
      city: "hcm",
    },
  ],
  hanoi: [
    {
      _id: "store3",
      name: "Chi nhánh Hoàn Kiếm",
      address: "789 Hoàng Kiếm, Hà Nội",
      phone: "024 1111 2222",
      deliveryTime: "35-50 phút",
      isOpen: true,
      city: "hanoi",
    },
  ],
  danang: [
    {
      _id: "store4",
      name: "Chi nhánh Hải Châu",
      address: "321 Trần Phú, Hải Châu, Đà Nẵng",
      phone: "0236 3333 4444",
      deliveryTime: "20-35 phút",
      isOpen: false,
      city: "danang",
    },
  ],
};

const CitySelectionModal = ({ onClose, onStoreSelected }) => {
  const {
    selectedCity,
    selectedStore, 
    availableStores,
    isLoadingStores,
    error,
    selectCity,
    selectStore,
    clearError,
    getAvailableCities,
    loadStoreProducts,
  } = useStoreSelectionStore();

  const [currentCities, setCurrentCities] = useState([]);
  const [currentStores, setCurrentStores] = useState([]);

  //! Hàm load danh sách thành phố từ API
  const loadCities = async () => {
    try {
      const cities = await getAvailableCities();
      setCurrentCities(cities.data || []);
    } catch (error) {
      console.error("Error loading cities:", error);
    }
  };

  //! Load danh sách thành phố khi component mount
  useEffect(() => {
    loadCities();
  }, [getAvailableCities]);

  //! Auto-load stores khi có selectedCity từ localStorage (sau refresh)
  useEffect(() => {
    if (selectedCity && availableStores.length === 0) {
      handleCitySelect(selectedCity);
    }
  }, [selectedCity]);

  //! Sync availableStores từ store vào local state
  useEffect(() => {
    setCurrentStores(availableStores);
  }, [availableStores]);

  //! Hàm xử lý chọn thành phố và tải danh sách cửa hàng
  const handleCitySelect = async (cityName) => {
    try {
      clearError();
      const stores = await selectCity(cityName);
      setCurrentStores(stores.data.stores || []);  // Lấy stores array thay vì data object
    } catch (error) {
      console.error("Error selecting city:", error);
    }
  };

  //! Xử lý chọn cửa hàng - lưu vào Zustand, load products, modal sẽ tự đóng qua state
  const handleStoreSelect = async (store) => {
    try {
      // Load products của store này từ MongoDB
      const storeData = await loadStoreProducts(store._id);
      
      // Callback để parent component biết store đã được chọn
      if (onStoreSelected) {
        onStoreSelected(store);
      }
      
      // Lưu store vào Zustand global state (tự động set isStoreModalOpen: false)
      selectStore(store);

    } catch (error) {
      console.error("Error selecting store:", error);
    }
  };

  //! Ngăn không cho đóng modal khi click backdrop (buộc phải chọn)
  const handleBackdropClick = (e) => {
    e.stopPropagation(); // Không cho phép đóng modal mà không chọn cửa hàng
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden"
        onClick={handleBackdropClick}
      >
        {/* Header - Tiêu đề */}
        <div className="bg-dark_blue text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <h2 className="text-lg font-semibold">
              {selectedStore ? "Đổi cửa hàng" : "Chọn cửa hàng"}
            </h2>
          </div>
          
          {/* Hiển thị nút X chỉ khi đã có selectedStore */}
          {selectedStore && (
            <button
              onClick={() => {
                if (onClose) {
                  onClose();
                }
              }}
              className="text-white hover:text-gray-300 transition-colors"
              title="Đóng"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Current Store Info - Hiển thị cửa hàng hiện tại nếu có */}
          {selectedStore && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm">Cửa hàng hiện tại:</span>
              </div>
              <p className="font-semibold text-green-900">{selectedStore.storeName || selectedStore.name}</p>
              <p className="text-sm text-green-700">
                {selectedStore.address && typeof selectedStore.address === 'object' 
                  ? `${selectedStore.address.street}, ${selectedStore.address.district}, ${selectedStore.address.city}`
                  : selectedStore.address || 'Địa chỉ không có sẵn'
                }
              </p>
            </div>
          )}
          
          {/* City Selection - Chọn thành phố */}
          <div className="mb-6">
            <h3 className="font-medium mb-3 text-gray-800">Chọn thành phố:</h3>
            <div className="grid grid-cols-1 gap-2">
              {currentCities.length > 0 ? (
                currentCities.map((city, index) => (
                  <button
                    key={city.id || city || index}
                    onClick={() => handleCitySelect(city.id || city)}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      selectedCity === (city.id || city)
                        ? "bg-orange-50 border-orange-500 text-orange-700"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-medium">{city.name || city}</span>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Đang tải danh sách thành phố...
                </div>
              )}
            </div>
          </div>

          {/* Store Selection - Chọn cửa hàng */}
          {selectedCity && (
            <div>
              <h3 className="font-medium mb-3 text-gray-800 flex items-center gap-2">
                <Store className="w-4 h-4" />
                Các cửa hàng tại{" "}
                {currentCities.find((c) => (c.id || c) === selectedCity)
                  ?.name || selectedCity}
              </h3>

              {isLoadingStores ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    Đang tải danh sách cửa hàng...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-600">
                  <p>{error}</p>
                  <button
                    onClick={() => handleCitySelect(selectedCity)}
                    className="mt-2 text-sm underline"
                  >
                    Thử lại
                  </button>
                </div>
              ) : currentStores.length > 0 ? (
                <div className="space-y-3">
                  {currentStores.map((store) => (
                    <button
                      key={store._id}
                      onClick={() => handleStoreSelect(store)}
                      disabled={store.status !== "active"}
                      className={`w-full p-4 border rounded-lg text-left transition-all ${
                        store.status === "active"
                          ? "bg-white border-gray-200 hover:bg-orange-50 hover:border-orange-300"
                          : "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800">
                          {store.storeName || store.name}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            store.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {store.status === "active" ? "Mở cửa" : "Đóng cửa"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {typeof store.address === "object"
                          ? `${store.address.street}, ${store.address.district}, ${store.address.city}`
                          : store.address}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {store.deliveryTime || "30-45 phút"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {store.phone}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Không có cửa hàng nào trong khu vực này</p>
                </div>
              )}
            </div>
          )}

          {/* Info Note - Ghi chú thông tin */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 Vui lòng chọn cửa hàng gần bạn nhất để xem thực đơn và đặt hàng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitySelectionModal;
