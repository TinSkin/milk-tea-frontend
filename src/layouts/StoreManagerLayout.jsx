import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "./hooks/useSidebar";
import Header from "./components/Header";
import RoleSidebar from "./components/RoleSidebar";
import PageHeader from "./components/PageHeader";

const StoreManagerLayoutContent = () => {
  const { isOpen } = useSidebar();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <RoleSidebar />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Header */}
        <Header />
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header - tự động lấy title và icon từ nav.schema.js */}
          <PageHeader />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const StoreManagerLayout = () => {
  return (
    <SidebarProvider>
      <StoreManagerLayoutContent />
    </SidebarProvider>
  );
};

export default StoreManagerLayout;
