import React from "react";

const CornerBorderBox = ({ children }) => {
  return (
    <div className="relative group w-[300px] h-[200px] bg-white rounded-xl shadow-md p-6">
      {/* Top-left */}
      <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-dark_blue opacity-0 group-hover:opacity-100 transition duration-300"></span>

      {/* Top-right */}
      <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-dark_blue opacity-0 group-hover:opacity-100 transition duration-300"></span>

      {/* Bottom-left */}
      <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-dark_blue opacity-0 group-hover:opacity-100 transition duration-300"></span>

      {/* Bottom-right */}
      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-dark_blue opacity-0 group-hover:opacity-100 transition duration-300"></span>

      {/* Content */}
      {children}
    </div>
  );
};

export default CornerBorderBox;
