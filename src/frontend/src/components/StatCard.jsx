function StatCard({ label, value, description, color = "primary" }) {
  const colorClasses = {
    primary: "bg-slate-800 border-brand-primary/30 hover:border-brand-primary/50",
    secondary: "bg-slate-800 border-brand-secondary/30 hover:border-brand-secondary/50",
    tertiary: "bg-slate-800 border-brand-tertiary/30 hover:border-brand-tertiary/50",
    gray: "bg-slate-800 border-slate-600 hover:border-slate-500",
  };

  const valueColors = {
    primary: "text-brand-primary",
    secondary: "text-brand-secondary",
    tertiary: "text-brand-tertiary",
    gray: "text-slate-400",
  };

  return (
    <div
      className={`rounded-xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 ${colorClasses[color] || colorClasses.primary}`}
    >
      <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-bold ${valueColors[color] || valueColors.primary}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default StatCard;