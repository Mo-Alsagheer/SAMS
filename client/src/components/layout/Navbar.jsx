import { useState, useEffect } from "react";
import logo from "../../assets/logo.png"; 
import logoScroll from "../../assets/logoScroll.png";   
import { HiMenuAlt3, HiX } from "react-icons/hi"; 

function Navbar() {
  const navLinks = ["Home", "About", "Committees", "Login"];
  const [hoveredLink, setHoveredLink] = useState("Login");
  const [isOpen, setIsOpen] = useState(false); 
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
      ? "bg-white/90 backdrop-blur-md shadow-md py-3" 
      : "bg-transparent py-5" 
    }`}>
      
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        <div className="flex items-center gap-2 md:gap-3">
       
          <img 
            src={isScrolled ? logoScroll : logo} 
            alt="IEEE Logo" 
            className="h-8 md:h-10 w-auto transition-all duration-500 ease-in-out transform active:scale-95" 
          />
          <span className={`text-xl md:text-2xl font-black tracking-tighter transition-colors duration-500 ${
            isScrolled ? "text-blue-900" : "text-white"
          }`}>
            IEEE
          </span>
        </div>

        <button 
          className={`lg:hidden text-3xl transition-colors ${isScrolled ? "text-blue-900" : "text-white"}`}
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
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                hoveredLink === link
                  ? (isScrolled ? "bg-blue-800 text-white shadow-lg scale-105" : "bg-white text-blue-900 scale-105 shadow-xl")
                  : (isScrolled ? "text-slate-600 hover:text-blue-800" : "text-white/90 hover:text-white")                    
              }`}
            >
              {link}
            </a>
          ))}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;