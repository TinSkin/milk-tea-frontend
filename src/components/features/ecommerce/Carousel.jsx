import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function Carousel({ images }) {
  return (
    <div className="w-full h-full">
    <Swiper
      spaceBetween={0}
      slidesPerView={1}
      loop={true}
      modules={[Navigation, Pagination, Autoplay]}
      navigation={{
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      }}
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      className="my-swiper"
    >
      {images.map((src, index) => (
        <SwiperSlide key={index}>
          <img
            src={src}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover rounded-xl"
          />
        </SwiperSlide>
      ))}
      <div className="swiper-button-prev"></div>
      <div className="swiper-button-next"></div>
    </Swiper>
  </div>
  
  );
}

export default Carousel;
