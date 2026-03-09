import stats from "@/assets/stats.jpg";

function StatsSection() {
  const statsData = [
    { label: "Committees", value: "10+", color: "from-blue-400 to-cyan-300" },
    { label: "Students", value: "500+", color: "from-blue-400 to-cyan-300" },
    { label: "Directors", value: "100+", color: "from-blue-400 to-cyan-300" },
  ];

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden py-18">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
        style={{
          backgroundImage: `url(${stats})`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 via-black/60 to-blue-900/90"></div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 mb-4 text-sm font-bold tracking-widest text-blue-400 uppercase bg-blue-900/40 backdrop-blur-sm rounded-full border border-blue-400/30">
            Our Impact
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic">
            IEEE by the <span className="text-blue-400">Numbers</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center transition-all duration-300 hover:bg-white/10 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div
                className={`text-5xl md:text-6xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}
              >
                {stat.value}
              </div>

              <div className="text-gray-300 font-bold text-lg uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
