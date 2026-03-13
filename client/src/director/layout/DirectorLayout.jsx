import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/shared/Sidebar";
import { directormenu } from "../../assets/menus";

function DirectorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("directorSidebarOpen");
    return saved === null ? true : JSON.parse(saved);
  });


  useEffect(() => {
    localStorage.setItem("directorSidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
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