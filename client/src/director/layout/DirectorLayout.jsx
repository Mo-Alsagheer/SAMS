import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { LayoutDashboardIcon } from "lucide-react";
import { VscRequestChanges } from "react-icons/vsc";
import Sidebar from "../../components/shared/Sidebar";

function DirectorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("directorSidebarOpen");
    return saved === null ? true : JSON.parse(saved);
  });

  const directormenu = [
    {
      icon: LayoutDashboardIcon,
      path: "",
      name: "Dashboard",
    },
    {
      icon: VscRequestChanges,
      path: "applications",
      name: "Applications",
    },
  ];

  useEffect(() => {
    localStorage.setItem("directorSidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <div className="flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        title="Director"
        menuitems={directormenu}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main
        className={`
          flex-1 p-5 pt-8 transition-all duration-300
          ${sidebarOpen ? "md:ml-72" : "md:ml-20"}
          ml-0
        `}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default DirectorLayout;