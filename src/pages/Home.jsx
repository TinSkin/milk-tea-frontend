import React from "react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Import Components
import Header from "../components/Header";
import Footer from "../components/Footer";
import Carousel from "../components/Carousel";

function Home() {
  const images = [
    "https://katinat.vn/wp-content/uploads/2023/12/KAT_NEWBRANDING_COVERFB_3-scaled.jpg",
    "https://katinat.vn/wp-content/uploads/2025/01/KMDN_BANNER-WEB.jpg",
    "https://katinat.vn/wp-content/uploads/2024/04/KAT_BANNER-WEB_OBL.jpg",
    "https://katinat.vn/wp-content/uploads/2024/04/KAT_BANNER-WEB_BGDN.jpg",
    "https://katinat.vn/wp-content/uploads/2025/03/KAT_WEBSITE-BANNER.jpg",
  ];

  return (
    <div>
      <Header />
      <div className="bg-[#151d2d]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="mx-auto px-4 py-4"
        >
          {/* Carousel */}
          <Carousel images={images} />
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center max-w-[1600px] mx-auto lg:gap-36 mt-24">
          {/* Left side */}
          <div className="lg:max-w-lg space-y-10 text-center lg:text-left">
            <h2 className="text-3xl md:text-9xl font-extrabold bg-gradient-to-b from-[#f2b53b] to-[#D5BB93] bg-clip-text text-transparent">
              PENNY
            </h2>

            <h1 className="text-5xl text-white/80 md:text-5xl font-semibold">
              Ngọt lành, tươi mới, tràn năng lượng
            </h1>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="bg-gradient-to-r from-[#f2b53b] to-[#D5BB93] text-black font-bold px-8 py-3 rounded-xl leading-snug hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                style={{
                  boxShadow: "0 0 5px #fde599, 0 0 5px #fcd34d",
                }}
              >
                Đặt ngay
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/signup"
                className="border-2 text-white px-8 py-3 rounded-xl leading-snug font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                style={{
                  borderColor: "#f2b53b",
                  boxShadow: "0 0 5px #fde599, 0 0 5px #fcd34d",
                }}
              >
                Đăng ký
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="relative lg:mt-0 flex justify-center items-center">
            {/* Chữ nền (lớp dưới) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0 space-y-4">
              {/* Hàng trên: đầy - rỗng - đầy */}
              <div className="flex space-x-6">
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-7xl md:text-[8rem] font-extrabold text-[#D5BB93] opacity-30">
                    TASTY
                  </span>
                  <span className="text-7xl md:text-[8rem] font-extrabold text-[#D5BB93] opacity-30">
                    TASTY
                  </span>
                </div>
                <span
                  className="text-7xl md:text-[8rem] font-extrabold mt-1"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: "3px #D5BB93",
                    fontWeight: "800",
                    opacity: 0.3,
                  }}
                >
                  DRINK DRINK
                </span>
              </div>

              {/* Hàng dưới: rỗng - đầy - rỗng */}
              <div className="flex space-x-6">
                <span
                  className="text-7xl md:text-[8rem] font-extrabold mt-1"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: "3px #D5BB93",
                    fontWeight: "800",
                    opacity: 0.3,
                  }}
                >
                  TASTY TASTY
                </span>
                <div className="flex flex-col items-center space-y-3">
                  <span className="text-7xl md:text-[8rem] font-extrabold text-[#D5BB93] opacity-30">
                    DRINK
                  </span>
                  <span className="text-7xl md:text-[8rem] font-extrabold text-[#D5BB93] opacity-30">
                    DRINK
                  </span>
                </div>
              </div>
            </div>

            {/* Hình nằm trên chữ */}
            <img
              src="/src/img/menu1.png"
              alt="Frappuccino"
              className="w-80 lg:w-[600px] object-contain z-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 justify-items-center items-center mt-10 max-w-7xl mx-auto">
          <div className="relative bg-gray-200 rounded-lg aspect-square w-full max-w-[300px] flex items-center justify-center mt-8">
            <img
              src="https://i.pinimg.com/736x/63/f4/fb/63f4fb04984e840945706c6a823f5079.jpg"
              alt="Image 1"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
          </div>
          {/* <div className="text-white rounded-lg aspect-square w-full max-w-[300px] flex items-center justify-center text-xl text-left leading-loose">Sinh tố dâu tươi mát, chua ngọt tự nhiên, mang đến hương vị sảng khoái và giàu vitamin</div> */}
          <div className="text-[#e8d8c1] rounded-lg aspect-square w-full max-w-[300px] flex flex-col items-start justify-center text-xl text-left leading-loose mt-8 p-4">
            <div className="text-[#e5b85e]  text-3xl font-bold mb-4">
              Trà sữa trân châu
            </div>
            <div>
              Trà sữa thơm béo, hòa quyện hương trà đậm đà cùng topping đa dạng,
              mang đến trải nghiệm ngọt ngào và tươi mới mỗi ngày
            </div>
          </div>

          <div className="relative bg-gray-200 rounded-lg aspect-square w-full max-w-[300px] flex items-center justify-center mt-8">
            <img
              src="https://i.pinimg.com/736x/c9/24/e1/c924e1143beecc428d5c88985bb6b979.jpg"
              alt="Image 3"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
          </div>
          <div className="text-[#e8d8c1] rounded-lg aspect-square w-full max-w-[300px] flex flex-col items-start justify-center text-xl text-left leading-loose mt-8 p-4">
            <div className="text-[#e5b85e] text-3xl font-bold mb-4">
              Oreo đá xay
            </div>
            <div>
              Oreo đá xay thơm béo, hòa quyện giữa vị ngọt mát của kem sữa và
              vụn bánh oreo giòn tan.
            </div>
          </div>
          <div className="text-[#e8d8c1] rounded-lg aspect-square w-full max-w-[300px] flex flex-col items-start justify-center text-xl text-left leading-loose mt-8 p-4">
            <div className="text-[#e5b85e]  text-3xl font-bold mb-4">
              {" "}
              Sinh tố dâu
            </div>
            <div>
              Sinh tố dâu tươi mát, chua ngọt tự nhiên, mang đến hương vị sảng
              khoái và giàu vitamin
            </div>
          </div>
          <div className="relative bg-gray-200 rounded-lg aspect-square w-full max-w-[300px] flex items-center justify-center mt-8">
            <img
              src="https://i.pinimg.com/736x/da/e3/a8/dae3a884189cee56fde94fcefff0a036.jpg"
              alt="Image 6"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
          </div>
          <div className="text-[#e8d8c1] rounded-lg aspect-square w-full max-w-[300px] flex flex-col items-start justify-center text-xl text-left leading-loose mt-8 p-4">
            <div className="text-[#e5b85e]  text-3xl font-bold mb-4">
              {" "}
              Matcha latte
            </div>
            <div>
              Matcha Latte thanh mát, hương trà xanh Nhật Bản đậm vị kết hợp
              cùng sữa béo ngậy, mang đến cảm giác vừa tinh tế vừa thư giãn.
            </div>
          </div>
          <div className="relative bg-gray-200 rounded-lg aspect-square w-full max-w-[300px] flex items-center justify-center mt-8">
            <img
              src="https://i.pinimg.com/1200x/83/af/55/83af5558c6e5fc3bfb3a71ff80083f3a.jpg"
              alt="Image 8"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 max-w-7xl items-center justify-items-center mx-auto ">
          {/* Left Text */}
          <div className="col-span-1 text-right space-y-6">
            <h3 className="text-6xl font-extrabold text-[#c4855a] mb-12 tracking-widest leading-[1.3]">
              THỬ LÀ GHIỀN
            </h3>

            <h3 className="text-3xl font-bold text-[#c4855a]">Trà sữa</h3>
            <p className="text-gray-200 text-xl">
              Béo ngậy, ngọt dịu, mê ngay từ lần thử.
            </p>
          </div>

          {/* Center Image */}
          <div className="col-span-2 flex justify-center">
            <img
              src="/src/img/menu2.png"
              alt="Coffee"
              className="w-[900px] object-cover "
            />
          </div>

          {/* Right Text */}
          <div className="col-span-1 text-left space-y-6">
            <h3 className="text-3xl font-bold text-[#c4855a]">Coffee</h3>
            <p className="text-gray-200 text-xl">
              Rang xay thủ công, giữ trọn hương vị
            </p>
            <h3 className="text-3xl font-bold text-[#c4855a]">Trà trái cây</h3>
            <p className="text-gray-200 text-xl">
              Tươi mát, thanh nhẹ, sảng khoái mỗi ngụm
            </p>
          </div>
        </div>

        <div className=" py-12 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="text-center my-16 space-y-4">
            <h2 className="text-xl md:text-7xl font-extrabold leading-none py-4 bg-gradient-to-b from-[#fdad00] to-[#ffe87f] bg-clip-text text-transparent overflow-visible">
              SẮP CÓ MẶT
            </h2>
            <h2 className="text-xl md:text-6xl font-extrabold leading-none py-4 bg-gradient-to-b from-[#fdad00] to-[#ffe87f] bg-clip-text text-transparent overflow-visible">
              Trọn bộ xoài cực đỉnh
            </h2>
          </div>

          {/* Grid tổng thể */}
          <div className="grid md:grid-cols-3 gap-10 items-stretch">
            {/* Card 1 */}
            <div className="bg-[#e0d4c4] rounded-xl shadow-md overflow-hidden flex flex-col items-center text-center">
              <img
                src="https://i.pinimg.com/736x/db/e6/c3/dbe6c332b3f8361ab17b9d1a900319a0.jpg"
                alt="Espresso"
                className="w-full h-56 object-cover rounded-lg mb-4"
              />
              <div className="p-6">
                <h3 className="text-3xl text-[#5C4033]  font-bold mb-2">
                  Sữa chua xoài
                </h3>
                <p className="text-gray-600 mb-4 text-sm flex-1">
                  Thưởng thức sữa chua xoài chua nhẹ, ngọt thanh cùng miếng xoài
                  tươi mọng, đánh thức vị giác trong từng thìa mát lạnh
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#e0d4c4] rounded-xl shadow-md overflow-hidden flex flex-col items-center text-center ">
              <img
                src="https://i.pinimg.com/1200x/ba/d5/d1/bad5d1553ad63dc774281f38e73b1158.jpg"
                alt="Iced Favorites"
                className="w-full h-56 object-cover rounded-lg mb-4"
              />
              <div className="p-6">
                <h3 className="text-3xl text-[#5C4033]  font-bold mb-2">
                  Trà sữa xoài
                </h3>
                <p className="text-gray-600 mb-4 text-sm flex-1">
                  Hòa quyện vị béo ngậy của sữa tươi cùng hương xoài chín vàng,
                  tà sữa xoài mang đến trải nghiệm ngọt ngào khó quên
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#e0d4c4] rounded-xl shadow-md overflow-hidden flex flex-col items-center text-center ">
              <img
                src="https://i.pinimg.com/1200x/85/98/a9/8598a9c3b9e3290fea703a9f38265989.jpg"
                alt="Organic Beans"
                className="w-full h-56 object-cover rounded-lg mb-4"
              />
              <div className="p-6">
                <h3 className="text-3xl text-[#5C4033]  font-bold mb-2">
                  Trà xoài chanh xả
                </h3>
                <p className="text-gray-600 mb-4 text-sm flex-1">
                  Sự kết hợp độc đáo giữa trà xoài thanh mát, chanh chua dịu và
                  hương sả thoang thoảng
                </p>
              </div>
            </div>
          </div>

          {/* Khối quảng cáo */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Promo left */}
            <div className="bg-white rounded-xl shadow-md flex items-center overflow-hidden">
              <img
                src="https://i.pinimg.com/736x/59/60/73/596073ca2b089d66add3e016eb2d7df4.jpg"
                alt="Promo Coffee"
                className="w-full h-80 object-cover"
              />
            </div>

            {/* Promo right */}
            <div className="bg-[#3a2d2d] rounded-xl shadow-md flex items-center overflow-hidden">
              <img
                src="https://i.pinimg.com/originals/36/b0/77/36b0774f746a63bcc30f1daf4c923040.jpg"
                alt="Promo Coffee"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default Home;
