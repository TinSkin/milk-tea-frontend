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
        animate={{ opacity: 2 }}
        transition={{ duration: 2 }}
        className="mx-auto px-4 py-4"
      >
        {/* Carousel */}
        <Carousel images={images} />
      </motion.div>
      

      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto lg:gap-16 mt-24 px-4">
 {/* Left side */}
<div className="lg:max-w-lg space-y-10 text-center lg:text-left">
  <h2 className="text-3xl md:text-9xl font-extrabold text-[#f2b53b]">
    PENNY
  </h2>
  <h1 className="text-5xl text-white/80 md:text-5xl font-semibold">
    Ngọt lành, tươi mới, tràn năng lượng
  </h1>

  <div className="flex flex-col sm:flex-row gap-4">
    <Link
      to="/login"
      className="bg-gradient-to-r font-bold from-[#f2b53b] to-[#e7a927] text-black px-8 py-3 rounded-xl leading-snug hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
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
            color: 'transparent',
            WebkitTextStroke: '3px #D5BB93',
            fontWeight: '800',
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
            color: 'transparent',
            WebkitTextStroke: '3px #D5BB93',
            fontWeight: '800',
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
      className="w-80 lg:w-[500px] object-contain z-10"
    />
  </div>
</div>


      <Footer />
    </div>
    </div>
  );
}

export default Home;
