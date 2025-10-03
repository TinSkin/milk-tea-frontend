import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const StoreManagerLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StoreManagerLayout;