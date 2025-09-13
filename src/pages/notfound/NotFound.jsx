import React from "react";

import Header from "../../components/Header";
import { Link } from "react-router-dom";

import "./style.css";

const NotFound = () => {
  return (
    <>
      <div className="custom-warning-wrapper">
        <h1 className="custom-warning-title">
          <span>404</span>
        </h1>
        <Link
          to={"/"}
          className="bg-dark_blue hover:bg-logo_color px-8 py-4 mt-9 text-logo_color hover:text-dark_blue z-10 font-semibold rounded-md border-solid border-4 border-logo_color text-lg focus:outline-none"
        >
          <span className="">Trở về trang chủ</span>
        </Link>
      </div>
    </>
  );
};

export default NotFound;
