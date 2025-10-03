import { useState } from "react";
import LocationSelectionModal from "./LocationSelectionModal"; // Chọn địa chỉ (3 options)
import CitySelectionModal from "./CitySelectionModal"; // Chọn cửa hàng

const StoreSelectionFlow = ({ isOpen, onClose, onStoreSelected }) => {
  const [currentStep, setCurrentStep] = useState("address"); // "address" | "store"
  const [addressData, setAddressData] = useState(null);

  //! Xử lý khi user đã chọn cách xác định địa chỉ
  const handleAddressSet = (data) => {
    setAddressData(data);
    
    if (data.type === "skip") {
      // Skip thì chuyển luôn đến chọn cửa hàng (show all)
      setCurrentStep("store");
    } else {
      // Có address thì chuyển đến chọn cửa hàng trong khu vực
      setCurrentStep("store");
    }
  };

  //! Reset khi đóng modal - Default là skip để không block user
  const handleClose = () => {
    // Nếu user tắt modal mà chưa chọn gì, tự động skip
    if (!addressData) {
      handleAddressSet({
        type: "skip",
        address: null,
        coordinates: null,
        stores: "all",
      });
      return; // Không reset, để chuyển đến step store
    }

    // Reset bình thường
    setCurrentStep("address");
    setAddressData(null);
    onClose();
  };

  //! Quay lại bước chọn địa chỉ
  const handleBackToAddress = () => {
    setCurrentStep("address");
    setAddressData(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {currentStep === "address" && (
        <LocationSelectionModal
          onClose={handleClose}
          onAddressSet={handleAddressSet}
        />
      )}

      {currentStep === "store" && (
        <CitySelectionModal
          addressData={addressData}
          onClose={handleClose}
          onBack={handleBackToAddress}
          onStoreSelected={onStoreSelected}
        />
      )}
    </>
  );
};

export default StoreSelectionFlow;
