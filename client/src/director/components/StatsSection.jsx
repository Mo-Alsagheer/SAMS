import StatCard from "./StatCard";

function StatsSection({ stats }) {
  return (
    <div className="grid md:grid-cols-3  gap-4">
      {stats.map((item, index) => (
        <StatCard key={index} title={item.title} value={item.value} />
      ))}
    </div>
  );
}

export default StatsSection;