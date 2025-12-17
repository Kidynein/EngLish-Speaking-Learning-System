function TopicCard({ title, percent, emoji, color, onClick }) {
  // Dynamic color based on progress percentage
  const getProgressColor = (percent) => {
    if (percent >= 100) return 'from-green-500 to-emerald-600';     // Completed
    if (percent >= 50) return 'from-blue-500 to-blue-600';          // In progress
    if (percent > 0) return 'from-yellow-500 to-orange-500';        // Started
    return 'from-gray-400 to-gray-500';                             // Not started
  };

  return (
    <div className="group relative bg-emerald-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-green-200/50 transition-all duration-300 overflow-hidden">
      {/* Background gradient overlay */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${color} transition-opacity duration-300`}
      ></div>

      <div className="relative space-y-4">
        {/* Header: Emoji and Progress Circle */}
        <div className="flex items-center justify-between">
          <div className="text-4xl">{emoji}</div>
          <div
            className={`w-14 h-14 rounded-full bg-gradient-to-br ${getProgressColor(percent)} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow`}
          >
            {percent}%
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">{percent}% complete</p>
        </div>

        {/* Start Button */}
        <button
          onClick={onClick}
          className={`w-full mt-4 py-2.5 px-4 bg-gradient-to-r ${color} text-white font-semibold rounded-lg hover:shadow-md hover:brightness-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-200`}
        >
          Start
        </button>
      </div>
    </div>
  );
}

export default TopicCard;