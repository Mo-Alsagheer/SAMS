import {
  SidebarProvider,
  SidebarInset,
  Sidebar,
} from "@/components/ui/sidebar";
import DirectorSidebar from "../components/sidebars/DirectorSidebar";
import ExecutiveSidebar from "../components/sidebars/ExecutiveSidebar";
import { Outlet } from "react-router-dom";

export default function Layout({ userRole }) {
  const sidebars = {
    director: DirectorSidebar,
    executive: ExecutiveSidebar,
  };

  const SidebarComponent = sidebars[userRole];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <SidebarComponent />
        <SidebarInset>
          <main className="flex-1 p-6 bg-[#fafafa] dark:bg-gray-900">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
