
const distance = Math.random() * 20; // 0-20km random
const canDeliver = distance <= 10;   // Chỉ giao trong 10km

const mockValidation = {
  canDeliver,
  distance: distance.toFixed(1),
  deliveryFee: canDeliver ? (distance < 5 ? 15000 : 25000) : null,
  estimatedTime: canDeliver ? "30-45 phút" : null,
  reason: !canDeliver ? "Ngoài khu vực giao hàng (> 10km)" : null,
};
