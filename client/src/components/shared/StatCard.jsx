const colorMap = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-accent text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "primary",
}) => {
  return (
    <div className="stat-card">
      <div className="flex items-start p-2 rounded-lg bg-white border justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-xl font-bold font-display text-black">
            {value}
          </p>
          {subtitle && <p className="text-xs text-destructive">{subtitle}</p>}
          <div className="h-4">
            {trend && (
              <p
                className={`text-xs font-medium ${trend.positive ? "text-success" : "text-destructive"}`}
              >
                {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
