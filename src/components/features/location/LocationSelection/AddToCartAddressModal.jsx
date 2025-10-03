import { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Edit3,
  X,
  AlertCircle,
  CheckCircle,
  Store,
  ShoppingCart,
} from "lucide-react";
import { useStoreSelectionStore } from "../../../../store/storeSelectionStore";

//! Component modal xử lý nhập địa chỉ khi Add to Cart với validation
const AddToCartAddressModal = ({
  onClose,
  onAddressConfirmed,
  selectedStore,
  product,
}) => {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const { clearError } = useStoreSelectionStore();

  //! Hàm validate store có thể giao hàng đến địa chỉ không
  const validateDelivery = async (address, coordinates = null) => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      // Random distance 
      const distance = Math.random() * 20; // 0-20km random
      const canDeliver = distance <= 10; // Chỉ giao trong 10km

      const test = {
        canDeliver,
        distance: distance.toFixed(1),
        deliveryFee: canDeliver ? (distance < 5 ? 15000 : 25000) : null,
        estimatedTime: canDeliver ? "30-45 phút" : null,
        reason: !canDeliver ? "Ngoài khu vực giao hàng (> 10km)" : null,
      };
      setValidationResult(test);
      return test;
    } catch (error) {
      setLocationError("Không thể kiểm tra khu vực giao hàng");
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  //! Hàm tự động định vị
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
          // latitude: vĩ độ - longitude: kinh độ
          const { latitude, longitude } = position.coords;
          console.log("User location:", { latitude, longitude });

          // Vị trí người dùng
          const address = `Vị trí hiện tại (${latitude.toFixed(
            6
          )}, ${longitude.toFixed(6)})`;
          console.log("Detected user address:", address);

          setUserLocation({ address, latitude, longitude });

          await validateDelivery(address, { latitude, longitude });
        } catch (error) {
          setLocationError("Không thể xác định vị trí");
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
        maximumAge: 300000,
        enableHighAccuracy: true,
      }
    );
  };

  //! Hàm xử lý nhập địa chỉ thủ công và validate
  const handleManualAddressSubmit = async () => {
    if (!manualAddress.trim()) {
      setLocationError("Vui lòng nhập địa chỉ");
      return;
    }

    try {
      clearError();
      setLocationError(null);

      setUserLocation({ address: manualAddress.trim() });

      // Validate delivery
      await validateDelivery(manualAddress.trim());
    } catch (error) {
      setLocationError("Không thể kiểm tra địa chỉ này");
    }
  };

  //! Xử lý xác nhận địa chỉ và thêm vào cart
  const handleConfirmAddress = () => {
    if (validationResult?.canDeliver && userLocation) {
      onAddressConfirmed({
        address: userLocation.address,
        coordinates: userLocation.latitude
          ? {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }
          : null,
        deliveryInfo: {
          fee: validationResult.deliveryFee,
          estimatedTime: validationResult.estimatedTime,
          distance: validationResult.distance,
        },
      });
    }
  };

  //! Reset modal về trạng thái ban đầu
  const handleReset = () => {
    setValidationResult(null);
    setUserLocation(null);
    setManualAddress("");
    setShowManualInput(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="text-lg font-semibold">
              Xác nhận địa chỉ giao hàng
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Store & Product Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">
                {selectedStore?.storeName}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Sản phẩm: <span className="font-medium">{product?.name}</span>
            </p>
          </div>

          {/* Current Status */}
          {!userLocation && (
            <>
              <p className="text-gray-600 mb-4 text-sm">
                Vui lòng nhập địa chỉ giao hàng để kiểm tra khả năng giao hàng:
              </p>

              {/* Options */}
              <div className="space-y-3 mb-4">
                {/* Auto Detect */}
                <button
                  onClick={handleAutoDetectLocation}
                  disabled={isDetectingLocation}
                  className="w-full p-3 border-2 border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      {isDetectingLocation ? (
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Navigation className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <span className="font-medium text-gray-800">
                      {isDetectingLocation
                        ? "Đang xác định..."
                        : "Sử dụng vị trí hiện tại"}
                    </span>
                  </div>
                </button>

                {/* Manual Input */}
                <div className="border-2 border-gray-200 rounded-lg">
                  <button
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="w-full p-3 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Edit3 className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800">
                        Nhập địa chỉ thủ công
                      </span>
                    </div>
                  </button>

                  {showManualInput && (
                    <div className="px-3 pb-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={manualAddress}
                          onChange={(e) => setManualAddress(e.target.value)}
                          placeholder="Nhập địa chỉ đầy đủ..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleManualAddressSubmit()
                          }
                        />
                        <button
                          onClick={handleManualAddressSubmit}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Kiểm tra
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Validation Loading */}
          {isValidating && (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
              <p className="text-gray-600">
                Đang kiểm tra khu vực giao hàng...
              </p>
            </div>
          )}

          {/* Validation Results */}
          {validationResult && userLocation && (
            <div className="mb-4">
              <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200">
                <div className="flex-shrink-0">
                  {validationResult.canDeliver ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-2">
                    {userLocation.address}
                  </h4>

                  {validationResult.canDeliver ? (
                    <div className="space-y-1 text-sm">
                      <p className="text-green-700">
                        Có thể giao hàng đến địa chỉ này
                      </p>
                      <p className="text-gray-600">
                        Khoảng cách: {validationResult.distance}km
                      </p>
                      <p className="text-gray-600">
                        Phí giao hàng:{" "}
                        {validationResult.deliveryFee?.toLocaleString("vi-VN")}đ
                      </p>
                      <p className="text-gray-600">
                        Thời gian dự kiến: {validationResult.estimatedTime}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p className="text-red-700">
                        Không thể giao hàng đến địa chỉ này
                      </p>
                      <p className="text-gray-600">
                        Khoảng cách: {validationResult.distance}km
                      </p>
                      <p className="text-gray-600">{validationResult.reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {userLocation && validationResult && (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đổi địa chỉ
              </button>

              {validationResult.canDeliver ? (
                <button
                  onClick={handleConfirmAddress}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Thêm vào giỏ hàng
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Đóng
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {locationError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{locationError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToCartAddressModal;
