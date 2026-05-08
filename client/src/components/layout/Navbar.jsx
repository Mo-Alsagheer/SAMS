import { useState } from "react";
import { Link } from "react-router-dom";
import { NavHashLink } from "react-router-hash-link";
import logoScroll from "../../assets/logoScroll.png";
import { HiMenuAlt3, HiX } from "react-icons/hi";

function Navbar() {
  const navLinks = [
    { name: "Home", path: "/#" },
    { name: "About", path: "/#about" },
    { name: "Committees", path: "/committees" },
  ];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-500 bg-white/90 backdrop-blur-md shadow-md py-3">
      {" "}
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {" "}
        <Link
          to="/"
          className="flex items-center gap-2 md:gap-3 cursor-pointer"
        >
          {" "}
          <img
            src={logoScroll}
            alt="IEEE Logo"
            className="h-8 md:h-10 w-auto transition-all duration-500 ease-in-out"
          />{" "}
          <span className="text-xl md:text-2xl font-black tracking-tighter transition-colors duration-500 text-blue-900">
            IEEE{" "}
          </span>{" "}
        </Link>{" "}
        <button
          className="lg:hidden text-3xl transition-colors text-blue-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <HiX /> : <HiMenuAlt3 />}{" "}
        </button>{" "}
        <div className="hidden lg:flex items-center gap-4">
          {" "}
          {navLinks.map((link) => (
            <NavHashLink
              smooth
              key={link.name}
              to={link.path}
              className="px-4 py-2 font-bold transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 text-slate-600 hover:text-blue-800"
            >
              {link.name}{" "}
            </NavHashLink>
          ))}{" "}
          <Link
            to="/login"
            className="ml-4 px-8 py-2.5 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg active:scale-95 bg-blue-800 text-white shadow-blue-200"
          >
            Login{" "}
          </Link>{" "}
        </div>{" "}
      </div>{" "}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 p-4 flex flex-col gap-4">
          {" "}
          {navLinks.map((link) => (
            <NavHashLink
              smooth
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="font-bold text-slate-600 px-4 py-2 transition-colors hover:text-blue-800"
            >
              {link.name}{" "}
            </NavHashLink>
          ))}{" "}
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="font-bold text-slate-600 px-4 py-2 transition-colors hover:text-blue-800"
          >
            Login{" "}
          </Link>{" "}
        </div>
      )}{" "}
    </nav>
  );
}

export default Navbar;
