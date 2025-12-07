function TopicCard({ title, percent, emoji, color }) {
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
            className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow`}
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
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">{percent}% complete</p>
        </div>

        {/* Start Button */}
        <button
          className={`w-full mt-4 py-2.5 px-4 bg-gradient-to-r ${color} text-white font-semibold rounded-lg hover:shadow-md active:scale-95 transition-all duration-200`}
        >
          Start
        </button>
      </div>
    </div>
  );
}

export default TopicCard;