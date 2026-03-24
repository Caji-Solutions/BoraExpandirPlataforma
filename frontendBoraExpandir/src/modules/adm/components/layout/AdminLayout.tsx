import { ReactNode } from "react";
import { AdminSidebar } from "../AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/modules/shared/components/ui/sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <main className="p-6 bg-background min-h-screen">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
