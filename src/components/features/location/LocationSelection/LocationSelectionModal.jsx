import { useState } from "react";
import { MapPin, Navigation, Edit3, ShoppingBag, X } from "lucide-react";
import { useStoreSelectionStore } from "../../../../store/storeSelectionStore";

const LocationSelectionModal = ({ onClose, onAddressSet }) => {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [locationError, setLocationError] = useState(null);
  const { getStoresNearLocation, clearError } = useStoreSelectionStore(); 

  //! Hàm tự động định vị bằng Geolocation API
  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);
    clearError();

    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị tự động");
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log("User location:", { latitude, longitude });
          
          // Tạm thời mock - sau này sẽ call API thật
          const nearbyStores = await getStoresNearLocation(latitude, longitude);
          
          onAddressSet({
            type: "geolocation",
            coordinates: { latitude, longitude },
            address: "Vị trí hiện tại của bạn",
            stores: nearbyStores
          });
        } catch (error) {
          setLocationError("Không thể tìm cửa hàng gần bạn");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        let errorMessage = "Không thể xác định vị trí";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Bạn đã từ chối quyền truy cập vị trí";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Không thể xác định vị trí hiện tại";
            break;
          case error.TIMEOUT:
            errorMessage = "Hết thời gian chờ định vị";
            break;
        }
        setLocationError(errorMessage);
        setIsDetectingLocation(false);
      },
      {
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        enableHighAccuracy: true
      }
    );
  };

  //! Hàm xử lý nhập địa chỉ thủ công
  const handleManualAddressSubmit = async () => {
    if (!manualAddress.trim()) {
      setLocationError("Vui lòng nhập địa chỉ");
      return;
    }

    try {
      clearError();
      setLocationError(null);
      
      // TODO: Geocoding API để convert address thành coordinates
      // Sau đó tìm stores gần address đó
      console.log("Manual address:", manualAddress);
      
      onAddressSet({
        type: "manual",
        address: manualAddress.trim(),
        coordinates: null, // Sẽ có sau khi geocoding
        stores: [] // Sẽ tìm sau khi có coordinates
      });
    } catch (error) {
      setLocationError("Không thể tìm cửa hàng gần địa chỉ này");
    }
  };

  //! Hàm bỏ qua - cho phép browse tất cả
  const handleSkipAddressSelection = () => {
    onAddressSet({
      type: "skip",
      address: null,
      coordinates: null,
      stores: "all" // Flag để biết là show all stores
    });
  };

  //! Hàm xử lý đóng modal - tự động skip để không block user
  const handleModalClose = () => {
    // Tự động skip thay vì close hoàn toàn
    handleSkipAddressSelection();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              Chọn địa chỉ giao hàng
            </h2>
          </div>
          <button
            onClick={handleModalClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Bỏ qua và xem tất cả cửa hàng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 text-sm">
          Để xem menu phù hợp và tính phí giao hàng chính xác, vui lòng chọn một trong các cách sau:
        </p>
        
        {/* Skip hint */}
        <div className="mb-6 p-2 bg-gray-50 rounded-lg border-l-4 border-gray-300">
          <p className="text-xs text-gray-600">
            💡 <strong>Mẹo:</strong> Bạn có thể bấm "X" hoặc chọn "Xem tất cả cửa hàng" để khám phá menu trước
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-6">
          {/* Option 1: Auto Detect Location */}
          <button
            onClick={handleAutoDetectLocation}
            disabled={isDetectingLocation}
            className="w-full p-4 border-2 border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200">
                {isDetectingLocation ? (
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Navigation className="w-5 h-5 text-orange-600" />
                )}
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-800">
                  {isDetectingLocation ? "Đang xác định vị trí..." : "Tự động định vị"}
                </h3>
                <p className="text-sm text-gray-600">
                  Sử dụng GPS để tìm cửa hàng gần bạn nhất
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Manual Address Input */}
          <div className="border-2 border-gray-200 rounded-lg">
            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="w-full p-4 hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-800">Nhập địa chỉ</h3>
                  <p className="text-sm text-gray-600">
                    Tự nhập địa chỉ giao hàng của bạn
                  </p>
                </div>
              </div>
            </button>
            
            {showManualInput && (
              <div className="px-4 pb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Nhập địa chỉ của bạn..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualAddressSubmit()}
                  />
                  <button
                    onClick={handleManualAddressSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Option 3: Skip - Browse All */}
          <button
            onClick={handleSkipAddressSelection}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-800">Xem tất cả cửa hàng</h3>
                <p className="text-sm text-gray-600">
                  Khám phá menu, địa chỉ sẽ được hỏi khi đặt hàng
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Error Message */}
        {locationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{locationError}</p>
          </div>
        )}

        {/* Info Note */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 Địa chỉ giúp chúng tôi tính phí giao hàng và thời gian chính xác nhất
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectionModal;