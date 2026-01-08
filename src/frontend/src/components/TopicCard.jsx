function TopicCard({ title, percent, emoji, color, onClick }) {
  // Dynamic color based on progress percentage using brand colors
  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-brand-primary';           // Completed
    if (percent >= 50) return 'bg-brand-secondary';          // In progress
    if (percent > 0) return 'bg-brand-tertiary';             // Started
    return 'bg-slate-500';                                   // Not started
  };

  return (
    <div className="group relative bg-slate-800 border border-slate-700 rounded-xl p-6 hover:shadow-lg hover:border-brand-primary/50 transition-all duration-300 overflow-hidden">
      {/* Background gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-brand-primary to-brand-secondary transition-opacity duration-300"
      ></div>

      <div className="relative space-y-4">
        {/* Header: Emoji and Progress Circle */}
        <div className="flex items-center justify-between">
          <div className="text-4xl">{emoji}</div>
          <div
            className={`w-14 h-14 rounded-full ${getProgressColor(percent)} flex items-center justify-center text-slate-900 font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow`}
          >
            {percent}%
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(percent)} transition-all duration-500`}
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400">{percent}% complete</p>
        </div>

        {/* Start Button */}
        <button
          onClick={onClick}
          className="w-full mt-4 py-2.5 px-4 bg-brand-primary text-slate-900 font-semibold rounded-lg hover:bg-brand-primary-dark hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300"
        >
          Start
        </button>
      </div>
    </div>
  );
}

export default TopicCard;