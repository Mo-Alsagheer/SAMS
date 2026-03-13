import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu } from "react-icons/fi";

function Sidebar({ title, menuitems, open, setOpen }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  //! FIX
  const location = useLocation();
  const [activePath, setActivePath] = useState(() => {
    const saved = localStorage.getItem("activePath");
    return saved !== null ? saved : "";
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button>
          <FiMenu
            className="text-sidebar text-3xl cursor-pointer"
            onClick={() => setMobileOpen(true)}
          />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-opacity-100 z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen
            ? "bg-black/40 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full p-5 pt-8 z-50 bg-sidebar transform transition-all duration-300
          ${open ? "w-72" : "w-20"}
          md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Desktop toggle */}
        <FiMenu
          className="text-white text-3xl absolute right-2 top-9 cursor-pointer hidden md:block"
          onClick={() => setOpen(!open)}
        />

        {/* Title */}

        <h1
          className={`text-white origin-left font-light text-2xl duration-300 mb-10 ${
            !open && "scale-0"
          }`}
        >
          {title}
        </h1>

        {/* Menu Items */}
        {menuitems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = activePath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 text-lg font-light mb-6 px-2 py-2 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-inner"
                    : "text-sidebar-accent-foreground hover:bg-sidebar-accent"
                }
              `}
              onClick={() => {
                setMobileOpen(false);
                setActivePath(item.path);
                localStorage.setItem("activePath", item.path);
              }}
            >
              <IconComponent className="text-3xl" />
              <span
                className={`${!open && "hidden"} transition-all duration-200`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default Sidebar;
