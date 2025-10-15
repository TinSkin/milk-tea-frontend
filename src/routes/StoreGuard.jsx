import { useEffect } from "react";
import { useStoreSelectionStore } from "../store/storeSelectionStore";
import CitySelectionModal from "../components/features/location/LocationSelection/CitySelectionModal";
// import StoreSelectionFlow from "../components/features/location/LocationSelection/StoreSelectionFlow";

const StoreGuard = ({ children }) => {
  const { isStoreSelectionRequired, isStoreModalOpen, selectedStore } =
    useStoreSelectionStore();

  // Lấy functions từ store (không theo dõi changes của chúng)
  const openStoreModal = useStoreSelectionStore(
    (state) => state.openStoreModal
  );
  const closeStoreModal = useStoreSelectionStore(
    (state) => state.closeStoreModal
  );

  //! Kiểm tra xem có cần chọn cửa hàng không khi component được mount
  useEffect(() => {
    if (isStoreSelectionRequired()) {
      openStoreModal();
    }
  }, [isStoreSelectionRequired, openStoreModal]);

  //! Debug modal state changes
  useEffect(() => {
    if (!selectedStore) {
      console.log("StoreGuard - Modal Open/Close:", {
        selectedStore,
      });
    }
  }, [isStoreModalOpen, selectedStore]);

  return (
    <>
      {/* Nội dung Menu) */}
      {children}

      {/* Hiển thị modal chọn cửa hàng nếu cần */}
      {isStoreModalOpen && (
        <CitySelectionModal
          onClose={() => {
            closeStoreModal();
          }}
        />
      )}

      {/* Flow chọn store */}
      {/* {isStoreModalOpen && (
        <StoreSelectionFlow
          isOpen={isStoreModalOpen}
          onClose={closeStoreModal}
        />
      )} */}
    </>
  );
};

export default StoreGuard;
