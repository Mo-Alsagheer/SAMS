function StatCard({ title, value }) {
  return (
    <div className="bg-card border rounded-lg p-4 flex flex-col items-center justify-center">
      <p className="text-2xl font-semibold">{title}</p>

      <p className="text-muted-foreground text-lg">{value}</p>
    </div>
  );
}

export default StatCard;
