import React from "react";

import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 2 }}
        transition={{ duration: 2 }}
        className="max-w-7xl mx-auto my-[8rem] px-4"
      >
        {/* Carousel */}
        <Carousel images={images} />
      </motion.div>
      <Footer />
    </div>
  );
}

export default Home;
