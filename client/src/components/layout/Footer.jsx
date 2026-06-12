import { Link } from "react-router-dom";
import { NavHashLink } from "react-router-hash-link";
import logo from "@/assets/ieee__logo_white.png";
import {
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-blue-600 via-blue-800 to-blue-900 text-white overflow-hidden">
      <div className="container mx-auto px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/10">
        <div className="space-y-4">
          <NavHashLink smooth to="/#" className="flex items-center gap-1.5">
            <img
              src={logo}
              alt="IEEE Logo"
              className="h-8 md:h-10 w-auto transition-all duration-500 ease-in-out"
            />
            <span className="text-xl md:text-3xl font-bold text-white transition-colors duration-500 font-sans">
              IEEE
            </span>
          </NavHashLink>
          <p className="text-blue-100/70 leading-relaxed text-sm">
            Leading the student activity in our university since 1992. Building
            leaders for the future.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h6 className="text-white font-bold text-lg mb-2 uppercase tracking-wider">
            Explore
          </h6>
          <Link
            to="/committees"
            className="text-blue-100/70 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Technical Tracks
          </Link>
          <Link
            to="/committees"
            className="text-blue-100/70 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Non-Technical
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h6 className="text-white font-bold text-lg mb-2 uppercase tracking-wider">
            Quick Links
          </h6>
          <NavHashLink
            smooth
            to="/#about"
            className="text-blue-100/70 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            About IEEE
          </NavHashLink>
          <Link
            to="/committees"
            className="text-blue-100/70 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            All Committees
          </Link>
          <Link
            to="/application"
            className="text-blue-100/70 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Join Us
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h6 className="text-white font-bold text-lg mb-2 uppercase tracking-wider">
            Social Connect
          </h6>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/IEEE.FCIH/"
              className="text-2xl hover:text-cyan-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <FaFacebook />
            </a>
            <a
              href="https://twitter.com/IEEE_FCIHSB"
              className="text-2xl hover:text-cyan-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <FaTwitter />
            </a>
            <a
              href="https://www.linkedin.com/company/ieee-fcih"
              className="text-2xl hover:text-cyan-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://www.instagram.com/ieeefcihsb/"
              className="text-2xl hover:text-cyan-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-black/20 text-blue-100/50 text-xs md:text-sm">
        <div className="container mx-auto px-10 py-6 text-center">
          <p>
            © {new Date().getFullYear()} IEEE Student Activity. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
