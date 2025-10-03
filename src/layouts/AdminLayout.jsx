import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import AdminSidebar from "./components/AdminSidebar";
import { SidebarProvider, useSidebar } from "./hooks/useSidebar.jsx";

const AdminLayoutContent = () => {
  const { isOpen } = useSidebar();
  
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        {/* Header */}
        <Header />
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <AdminLayoutContent />
    </SidebarProvider>
  );
};

export default AdminLayout;