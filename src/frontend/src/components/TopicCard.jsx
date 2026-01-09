function TopicCard({ title, percent, onClick }) {
  // Dynamic color for linear progress bar
  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-brand-primary';           // Completed
    if (percent >= 50) return 'bg-brand-secondary';          // In progress
    if (percent > 0) return 'bg-brand-tertiary';             // Started
    return 'bg-slate-300 [.light-theme_&]:bg-slate-200';    // Not started
  };

  return (
    <div className="group relative bg-slate-800/50 [.light-theme_&]:bg-white border border-slate-700 [.light-theme_&]:border-transparent rounded-xl p-8 hover:shadow-xl hover:border-brand-primary/30 [.light-theme_&]:hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1 flex flex-col h-full">
      {/* Background gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-brand-primary to-brand-secondary transition-opacity duration-300 pointer-events-none"
      ></div>

      {/* Status Badge (Absolute Top-Right) */}
      <div className="absolute top-4 right-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 [.light-theme_&]:text-slate-400 py-1 px-2.5 rounded-lg bg-slate-800 [.light-theme_&]:bg-slate-100 border border-slate-700/50 [.light-theme_&]:border-slate-200">
          {percent >= 100 ? 'Done' : percent > 0 ? 'In Progress' : 'New'}
        </span>
      </div>

      {/* Main Content Wrapper (Flex Grow) */}
      <div className="grow flex flex-col justify-center text-center space-y-6">

        {/* Title - Visual Focal Point */}
        <div>
          <h3 className="text-2xl font-bold text-white [.light-theme_&]:text-slate-900 group-hover:text-brand-primary [.light-theme_&]:group-hover:text-emerald-600 transition-colors w-full px-2 leading-tight">
            {title}
          </h3>
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-2 max-w-[80%] mx-auto w-full">
          <div className="flex justify-between items-end px-1">
            <span className="text-xs font-medium text-slate-400 [.light-theme_&]:text-slate-500">Progress</span>
            <span className="text-xs font-bold text-white [.light-theme_&]:text-slate-700">{Math.round(percent)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-700 [.light-theme_&]:bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(percent)} transition-all duration-500 rounded-full`}
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Start Button (Always at bottom) */}
      <button
        onClick={onClick}
        className="w-full mt-6 py-3 text-sm font-bold rounded-xl
                     bg-emerald-600 text-white shadow-lg shadow-emerald-900/20
                     [.light-theme_&]:bg-brand-primary [.light-theme_&]:text-slate-900 [.light-theme_&]:shadow-brand-primary/20
                     hover:bg-emerald-500 [.light-theme_&]:hover:bg-brand-primary-dark
                     active:scale-95 transition-all duration-200"
      >
        {percent > 0 ? 'Continue Lesson' : 'Start Lesson'}
      </button>
    </div>
  );
}

export default TopicCard;