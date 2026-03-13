import Button from "../../../components/shared/Button";
import heroImage from "../../../assets/heroImage.jpg";
const HeroSection = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 pt-32 pb-40 lg:pt-48 lg:pb-60">
        <div className="container mx-auto px-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 text-center lg:text-left space-y-8 ">
              <div className="inline-block px-4 py-1 rounded-full bg-blue-400/20 border border-blue-300/30 text-blue-100 text-md font-medium backdrop-blur-sm">
                Best Student Activity Management
              </div>
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                Get Your Future <br />
                <span className="text-cyan-300">This IEEE Solution</span>
              </h1>
              <p className="text-blue-100 text-lg max-w-xl opacity-90 leading-relaxed">
                Unlock your leadership potential with our comprehensive
                platform. Streamline your committee's work and join a thriving
                community today.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button className="bg-white text-blue-800 hover:bg-cyan-50 shadow-blue-900/20">
                  Join a Committee
                </Button>
                <Button className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 shadow-none">
                  View Events
                </Button>
              </div>
            </div>

            <div className="lg:w-1/2 mt-16 lg:mt-0 relative flex justify-center">
              <div className="relative w-[80%] lg:w-[90%]">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
                <img
                  src={heroImage}
                  alt="Student picture"
                  className="rounded-3xl shadow-2xl border-8 border-white/10 relative z-10 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-[100px]"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.23,109.19,134.7,117.78,204.51,105.73A562,562,0,0,0,321.39,56.44Z"
              className="fill-white"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
