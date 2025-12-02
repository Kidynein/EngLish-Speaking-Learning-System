function StatCard({ label, value, description, color = "green" }) {
  const colorClasses = {
    green: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50",
    blue: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50",
    purple: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50",
  };

  return (
    <div
      className={`rounded-xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 ${colorClasses[color] || colorClasses.green}`}
    >
      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-green-600">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default StatCard;