import React from "react";

// Import img
import logo from "./../img/logo.png";
import googlePlay from "./../img/google-play.png";
import appStore from "./../img/app-store.png";
import boCongThuong from "./../img/bo-cong-thuong.png";

// Import icon
import {
  faMapMarkerAlt,
  faPhoneAlt,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faYoutube,
  faTiktok,
  faTwitter,
  faGooglePlus,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Footer = () => {
  return (
    <footer className="bg-dark_blue text-white text-sm pt-10 pb-6 border-t-[1.5rem] border-camel">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-9">
        {/* Logo */}
        <img src={logo} alt="penny logo" className="w-full h-50 mb-4" />

        {/* Thông tin công ty */}
        <div className="col-span-2">
          {/* Thông tin */}
          <h3 className="font-semibold mb-5 text-logo_color text-lg">
            CÔNG TY CP TM & DV PENNY VIỆT NAM
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="text-logo_color hover:text-yellow-500 mr-2"
              />
              <span>
                Số 404 Biệt Thự Hên Xui Sẽ Có Penny, Ninh Kiều, Cần Thơ
              </span>
            </li>
            <li className="flex items-center">
              <FontAwesomeIcon
                icon={faPhoneAlt}
                className="text-logo_color hover:text-yellow-500 mr-2"
              />{" "}
              1900.63.69.36
            </li>
            <li className="flex items-center">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-logo_color hover:text-yellow-500 mr-2"
              />{" "}
              info@pennymilktea.com
            </li>
            <li>Số ĐKKD: 0106341306. Ngày cấp: 16/03/2017.</li>
            <li>Nơi cấp: Sở KH & ĐT TP Hà Nội.</li>
          </ul>

          {/* Social Icon */}
          <div className="flex space-x-4 mt-4 text-xl">
            <a href="#" className="text-logo_color hover:text-yellow-500">
              <FontAwesomeIcon icon={faFacebook} className="mr-2" />
            </a>
            <a href="#" className="text-logo_color hover:text-yellow-500">
              <FontAwesomeIcon icon={faInstagram} className="mr-2" />
            </a>
            <a href="#" className="text-logo_color hover:text-yellow-500">
              <FontAwesomeIcon icon={faYoutube} className="mr-2" />
            </a>
            <a href="#" className="text-logo_color hover:text-yellow-500">
              <FontAwesomeIcon icon={faTiktok} className="mr-2" />
            </a>
            <a href="#" className="text-logo_color hover:text-yellow-500">
              <FontAwesomeIcon icon={faTwitter} className="mr-2" />
            </a>
            <a href="#" className="text-logo_color hover:text-yellow-500">
              <FontAwesomeIcon icon={faGooglePlus} className=" mr-2" />
            </a>
          </div>

          {/* App Download */}
          <div className="flex mt-9 w-[70%] flex-wrap justify-between gap-1">
            <a
              className="mb-2 w-[48%]"
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={googlePlay} alt="Google Play" />
            </a>
            <a
              className="mb-2 w-[48%]"
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={appStore} alt="App Store" />
            </a>
            <a
              className="mb-2 w-[48%]"
              href="https://www.moit.gov.vn/web/guest/home"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={boCongThuong} alt="Bộ Công Thương" />
            </a>
          </div>
        </div>

        {/* Về chúng tôi */}
        <div className="">
          <h3 className="font-semibold mb-5 text-logo_color text-lg">
            VỀ CHÚNG TÔI
          </h3>
          <ul className="space-y-4">
            <li className="cursor-pointer hover:underline">
              Giới thiệu về Penny
            </li>
            <li className="cursor-pointer hover:underline">Nhượng quyền</li>
            <li className="cursor-pointer hover:underline">
              Tin tức khuyến mại
            </li>
            <li className="cursor-pointer hover:underline">Cửa hàng</li>
            <li className="cursor-pointer hover:underline">Quy định chung</li>
            <li className="cursor-pointer hover:underline">
              TT liên hệ & ĐKKD
            </li>
          </ul>
        </div>

        {/* Chính sách */}
        <div className="">
          <h3 className="font-semibold mb-5 text-logo_color text-lg">
            CHÍNH SÁCH
          </h3>
          <ul className="space-y-4">
            <li className="cursor-pointer hover:underline">
              Chính sách thành viên
            </li>
            <li className="cursor-pointer hover:underline">
              Hình thức thanh toán
            </li>
            <li className="cursor-pointer hover:underline">
              Vận chuyển giao nhận
            </li>
            <li className="cursor-pointer hover:underline">
              Đổi trả và hoàn tiền
            </li>
            <li className="cursor-pointer hover:underline">
              Bảo vệ thông tin cá nhân
            </li>
            <li className="cursor-pointer hover:underline">
              Bảo trì, bảo hành
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom line */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-gray-300 border-t-[4px] border-camel pt-4 px-4">
        <p>
          {" "}
          <span className="font-bold text-logo_color">Penny Milk Tea</span> -
          Thương hiệu trà sữa tiên phong sử dụng nguồn nông sản Việt Nam
        </p>
        <p className="text-xs mt-2 italic">
          Copyrights © 2019 by{" "}
          <span className="font-bold text-logo_color">Penny</span>. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
