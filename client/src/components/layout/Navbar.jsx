import { useState } from "react";
import logo from "../../assets/logo.png";
import { HiMenuAlt3, HiX } from "react-icons/hi"; 

function Navbar() {
  const navLinks = ["Home", "About", "Committees", "Login"];
  const [hoveredLink, setHoveredLink] = useState("Login");
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/10 shadow-sm">
     
      <div className="container mx-auto px-6 md:px-12 h-16 md:h-16 flex items-center justify-between">
        
       
        <div className="flex items-center gap-2 md:gap-3">
          <img src={logo} alt="Logo" className="h-8 md:h-10 w-auto brightness-0 invert" />
          <span className="text-xl md:text-2xl font-black text-white tracking-tighter">SAMS</span>
        </div>

        
        <button 
          className="lg:hidden text-white text-3xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>

      
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              onMouseEnter={() => setHoveredLink(link)}
              onMouseLeave={() => setHoveredLink("Login")}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-500 ${
                hoveredLink === link
                  ? "bg-white text-blue-900 scale-110 shadow-lg"
                  : "text-white opacity-100"                    
              }`}
            >
              {link}
            </a>
          ))}
        </div>

       
        <div className={`absolute top-full left-0 w-full bg-blue-900/95 backdrop-blur-xl transition-all  duration-300 lg:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
          <div className="flex flex-col items-center py-8 gap-6">
            {navLinks.map((link) => (
              <a 
                key={link} 
                href="#" 
                className="text-white text-xl font-bold "
                onClick={() => setIsOpen(false)}
              >
                {link}
              </a>
            ))}
          </div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
// import { Link } from "react-router-dom"; // استيراد Link
// // ... باقي الـ imports

// // جوه الـ map في الناف بار:
// {navLinks.map((link) => (
//   <Link
//     key={link}
//     // بنحدد المسار: لو Home يروح لـ / ولو غيره يروح لاسم اللينك
//     to={link === "Home" ? "/" : `/${link.toLowerCase()}`}
//     onMouseEnter={() => setHoveredLink(link)}
//     onMouseLeave={() => setHoveredLink("Login")}
//     className={`px-6 py-2 rounded-full font-medium transition-all duration-500 ${
//       hoveredLink === link
//         ? "bg-white text-blue-900 shadow-lg scale-110"
//         : "text-white opacity-80"
//     }`}
//   >
//     {link}
//   </Link>
// ))}