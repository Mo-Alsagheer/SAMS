import logo from "../../assets/logo.png";
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-blue-600 via-blue-800 to-blue-900 text-white overflow-hidden">
   
      <div className="container mx-auto px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/10">
   
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="SAMS"
              className="h-12 w-auto brightness-0 invert"
            />
            <span className="text-3xl font-black tracking-tighter">SAMS</span>
          </div>
          <p className="text-blue-100/70 leading-relaxed text-sm">
            Leading the student activity in our university since 1992. Building
            leaders for the future.
          </p>
        </div>

      
        <div className="flex flex-col gap-3">
          <h6 className="text-white font-bold text-lg mb-2 uppercase tracking-wider">
            Services
          </h6>
          <a className="text-blue-100/70 hover:text-cyan-400 transition-colors cursor-pointer">
            Strategic Planning
          </a>
          <a className="text-blue-100/70 hover:text-cyan-400 transition-colors cursor-pointer">
            Member Welfare
          </a>
          <a className="text-blue-100/70 hover:text-cyan-400 transition-colors cursor-pointer">
            Event Management
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <h6 className="text-white font-bold text-lg mb-2 uppercase tracking-wider">
            Community
          </h6>
          <a className="text-blue-100/70 hover:text-cyan-400 transition-colors cursor-pointer">
            About SAMS
          </a>
          <a className="text-blue-100/70 hover:text-cyan-400 transition-colors cursor-pointer">
            Committees
          </a>
          <a className="text-blue-100/70 hover:text-cyan-400 transition-colors cursor-pointer">
            Our Success
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <h6 className="text-white font-bold text-lg mb-2 uppercase tracking-wider">
            Social Connect
          </h6>
          <div className="flex gap-4">
            <a className="text-2xl hover:text-cyan-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <FaFacebook />
            </a>
            <a className="text-2xl hover:text-cyan-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <FaTwitter />
            </a>
            <a className="text-2xl hover:text-cyan-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <FaYoutube />
            </a>
            <a className="text-2xl hover:text-cyan-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-black/20 text-blue-100/50 text-xs md:text-sm">
        <div className="container mx-auto px-10 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 SAMS Student Activity. All rights reserved.</p>

          <div className="flex flex-wrap justify-center gap-6">
            <a className="hover:text-white transition-colors cursor-pointer">
              Terms of Use
            </a>
            <a className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </a>
            <a className="hover:text-white transition-colors cursor-pointer">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
