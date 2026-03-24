import { Toaster } from "@/modules/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/modules/shared/components/ui/sonner";
import { TooltipProvider } from "@/modules/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import Dashboard from "../cliente/components/dashboard/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import ServiceCatalog from "./pages/admin/ServiceCatalog";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/admin/Settings";
import CockpitDoDoNo from "./pages/admin/CockpitDoDoNo";
import AuditoriaAprovacoes from "./pages/admin/AuditoriaAprovacoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/team"
            element={
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            }
          />
          <Route
            path="/services"
            element={
              <AdminLayout>
                <ServiceCatalog />
              </AdminLayout>
            }
          />
          <Route
            path="/audit"
            element={
              <AdminLayout>
                <AuditLogs />
              </AdminLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <AdminLayout>
                <Settings />
              </AdminLayout>
            }
          />
          <Route
            path="/cockpit"
            element={
              <AdminLayout>
                <CockpitDoDoNo />
              </AdminLayout>
            }
          />
          <Route
            path="/approvals"
            element={
              <AdminLayout>
                <AuditoriaAprovacoes />
              </AdminLayout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
