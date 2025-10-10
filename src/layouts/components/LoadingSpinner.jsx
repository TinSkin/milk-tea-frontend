import React from "react";
import PropTypes from "prop-types";

const LoadingSpinner = ({
  message = "Đang tải...",
  size = 24,
  color = "text-green_starbuck",
  className = "",
}) => {
  return (  
    <div className={`flex justify-center items-center py-8 ${className}`}>
      <div className="flex items-center">
        <svg
          className={`animate-spin mr-3 ${color}`}
          style={{ width: size, height: size }}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <span className="text-gray-200">{message}</span>
      </div>
    </div>
  );
};

// Khai báo kiểu dữ liệu props
LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
};

export default LoadingSpinner;
