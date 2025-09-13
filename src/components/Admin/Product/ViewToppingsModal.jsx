import { CupSoda, Coins } from "lucide-react";

const ViewToppingsModal = ({ toppings, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
    <div className="bg-white rounded-xl shadow-lg p-0 max-w-md w-full relative overflow-hidden">
      {/* Bill shape header */}
      <div className="bg-green_starbuck rounded-t-xl px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Danh sách topping
        </h2>
        <button
          className="text-white hover:text-yellow-200 text-lg font-bold"
          onClick={onClose}
          title="Đóng"
        >
          ×
        </button>
      </div>
      {/* Bill shape body */}
      <div className="px-6 py-4 bg-gradient-to-b from-camel/10 to-white">
        {/* Tiêu đề cột */}
        <div className="bg-camel/15 flex justify-between items-center p-2 border-b border-camel/30 mb-2">
          <span className="font-semibold text-dark_blue tracking-wide flex items-center gap-2">
            <CupSoda className="w-5 h-5 text-camel" />
            Tên topping
          </span>
          <span className="font-semibold text-orange-700 tracking-wide flex items-center gap-2">
            <Coins className="w-5 h-5 text-orange-500" />
            Giá tiền thêm
          </span>
        </div>
        <ul className="divide-y divide-camel/20">
          {toppings.map((topping, idx) => (
            <li key={idx} className="py-3 flex justify-between items-center">
              <span className="font-semibold text-dark_blue">
                {topping.name}
              </span>
              <span className="text-orange-600 font-bold">
                {topping.extraPrice?.toLocaleString("vi-VN")}₫
              </span>
            </li>
          ))}
        </ul>
      </div>
      {/* Bill shape footer */}
      <div className="bg-camel/10 rounded-b-xl px-6 py-3 flex justify-end">
        <button
          className="px-4 py-2 bg-camel text-white rounded shadow hover:bg-camel/90 font-semibold"
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
      {/* Decorative bill edges */}
      <div className="absolute left-0 right-0 -bottom-3 flex justify-between px-6 pointer-events-none select-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 bg-white rounded-full border border-camel -mb-3"
            style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04)" }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default ViewToppingsModal;
