import React from "react";
import AddToCartAddressModal from "./../location/LocationSelection/AddToCartAddressModal";

const Temp = () => {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [productToAdd, setProductToAdd] = useState(null);
  
  return (
    <>
      {/* Address Modal - Hiển thị sau khi chọn xong sản phẩm */}
      {showAddressModal && productToAdd && (
        <AddToCartAddressModal
          onClose={() => {
            setShowAddressModal(false);
            setProductToAdd(null);
          }}
          onAddressConfirmed={(address, deliveryInfo) => {
            // Thêm sản phẩm vào giỏ hàng với thông tin địa chỉ
            const productWithAddress = {
              ...productToAdd,
              deliveryAddress: address,
              deliveryInfo: deliveryInfo,
            };

            console.log("Adding to cart with address:", productWithAddress);
            addToCart(productWithAddress);

            // Đóng modal và reset state
            setShowAddressModal(false);
            setProductToAdd(null);

            Notification.success("Đã thêm sản phẩm vào giỏ hàng!");
          }}
          selectedStore={selectedStore}
          product={productToAdd}
        />
      )}
    </>
  );
};

export default Temp;
