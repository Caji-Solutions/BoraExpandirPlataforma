import { ReactNode, useState } from "react";
import { AdminSidebar } from "../AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="md:ml-64 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
