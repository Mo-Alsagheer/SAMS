import Button from "@/components/shared/Button";
import { Link } from "react-router-dom";

function LastSection() {
  return (
    <div className="px-6 py-12"> 
      <section className="relative max-w-6xl mx-auto overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 border border-blue-800/40 py-16 px-8 shadow-2xl shadow-blue-900/20">
        
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight uppercase italic leading-tight">
            Ready to Make an <br />
            <span className= "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Impact?</span>
          </h1>

          <p className="text-gray-300 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-medium">
            Sign up now to browse open positions and join the best student teams on campus. 
            Your leadership starts here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            
            <Button className="!bg-white/90 !text-blue-900 hover:!bg-blue-50 px-10 py-4 !text-lg font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
              <Link to="/committees">Explore</Link> 
            </Button>
            
            <Button className="!bg-transparent border-2 border-white/20 !text-white hover:!bg-white/10 px-10 py-4 !text-lg font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
              <Link to="/quiz">Take the Quiz</Link> 
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
      
export default LastSection;