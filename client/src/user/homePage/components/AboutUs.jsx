import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import aboutImg from "@/assets/about.jpg";

function AboutUs() {
  const navigate = useNavigate();

  return (
    <section id="about" className="max-w-[1200px] mx-auto px-6 py-16 lg:py-24 mt-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
      <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
        <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-4 tracking-tight italic">
          About <span className="text-blue-600">IEEE</span>
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-700 mb-6 leading-snug">
          Empowering Students to Lead, Innovate, and Shape Their Future Tracks.
        </h2>

        <div className="flex justify-center lg:justify-start gap-2 mb-6">
          <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
          <span className="w-3 h-3 bg-blue-500 rounded-full opacity-80"></span>
          <span className="w-3 h-3 bg-blue-400 rounded-full opacity-60"></span>
        </div>

        <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 font-medium">
          IEEE is a dedicated platform designed to bridge the gap between
          students and their passions. Through our diverse committees, we
          provide a structured environment where you can explore different
          tracks—from Technical to HR and Marketing. Join us to develop your
          skills, expand your network, and leave a lasting impact on your campus
          community.
        </p>

        <Button
          className="bg-blue-800 hover:bg-blue-900 text-white p-6  text-lg transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-200"
          onClick={() => navigate("/committees")}
        >
          Join Our Journey
        </Button>
      </div>

      <div className="flex-1 order-1 lg:order-2">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

          <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[420px] md:h-[420px] rounded-full shadow-2xl mx-auto overflow-hidden border-8 border-white">
            <img
              src={aboutImg}
              alt="IEEE Community"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          <div className="absolute bottom-8 right-8 bg-blue-800 text-white px-5 py-3 rounded-2xl shadow-lg hidden md:block animate-bounce border-2 border-white">
            <span className="font-bold text-sm tracking-wide">
              Find Your Track{" "}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;
