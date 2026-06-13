import Button from "@/components/shared/Button";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react"; 

function ExecutiveSection() {
  return (
    <div className="px-6 py-12">
   
      <section className="relative max-w-6xl mx-auto overflow-hidden rounded-[2.5rem]  bg-gradient-to-br  from-blue-950 via-blue-900 to-blue-950 py-16 px-8 md:px-16 shadow-2xl border border-slate-800/60 ">
        
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase border border-indigo-500/20">
              <ShieldCheck size={14} />
              Executive Board Leadership
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Lead the Strategy. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                Drive the Vision.
              </span>
            </h2>

            <p className="text-gray-300 text-sm md:text-base max-w-xl leading-relaxed font-medium">
              Discover high-level executive positions. Take charge of strategic planning, 
              manage core operations, and shape the future of our student community.
            </p>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto text-center">
            <Button className="w-full md:w-auto !bg-white/90 !text-blue-900 hover:!bg-blue-50 shadow-lg shadow-indigo-600/20 px-10 py-6 !text-lg font-bold rounded-xl transition-all hover:scale-105 active:scale-95 group">
              <Link to="/executiveRoles" className="flex items-center justify-center gap-2">
                <span>View Executive Roles</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </Button>
          </div>

        </div>
      </section>
    </div>
  );
}

export default ExecutiveSection;