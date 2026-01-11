import { Lock, Crown, Star } from 'lucide-react';

function TopicCard({ title, percent, onClick, requiredPlan = 'free', userPlan = 'free', onUpgradeClick }) {
  // Check if user has access to this topic
  const planHierarchy = { free: 0, premium: 1, pro: 2 };
  const hasAccess = planHierarchy[userPlan] >= planHierarchy[requiredPlan];

  // Determine if this is a premium/pro topic
  const isPremiumTopic = requiredPlan === 'premium';
  const isProTopic = requiredPlan === 'pro';
  const isExclusiveTopic = isPremiumTopic || isProTopic;

  // Get theme colors based on required plan
  const getThemeColors = () => {
    if (isProTopic) {
      return {
        border: 'border-purple-500/50 hover:border-purple-400',
        gradient: 'from-purple-600 to-pink-500',
        badge: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
        badgeIcon: <Crown size={12} className="mr-1" />,
        badgeText: 'PRO',
        button: 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400',
        progressBar: 'bg-purple-500',
        titleHover: 'group-hover:text-purple-400 [.light-theme_&]:group-hover:text-purple-600',
        overlay: 'from-purple-600 to-pink-500'
      };
    }
    if (isPremiumTopic) {
      return {
        border: 'border-emerald-500/50 hover:border-emerald-400',
        gradient: 'from-emerald-500 to-teal-500',
        badge: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
        badgeIcon: <Star size={12} className="mr-1" />,
        badgeText: 'PREMIUM',
        button: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400',
        progressBar: 'bg-emerald-500',
        titleHover: 'group-hover:text-emerald-400 [.light-theme_&]:group-hover:text-emerald-600',
        overlay: 'from-emerald-500 to-teal-500'
      };
    }
    // Free topic
    return {
      border: 'border-slate-700 [.light-theme_&]:border-transparent hover:border-brand-primary/30',
      gradient: 'from-brand-primary to-brand-secondary',
      badge: null,
      badgeIcon: null,
      badgeText: null,
      button: 'bg-emerald-600 hover:bg-emerald-500 [.light-theme_&]:bg-brand-primary [.light-theme_&]:hover:bg-brand-primary-dark',
      progressBar: percent >= 100 ? 'bg-emerald-500' : percent >= 50 ? 'bg-sky-500' : percent > 0 ? 'bg-teal-500' : 'bg-slate-400',
      titleHover: 'group-hover:text-brand-primary [.light-theme_&]:group-hover:text-emerald-600',
      overlay: 'from-brand-primary to-brand-secondary'
    };
  };

  const theme = getThemeColors();

  const handleClick = () => {
    if (!hasAccess) {
      // If user doesn't have access, trigger upgrade modal
      if (onUpgradeClick) {
        onUpgradeClick(requiredPlan);
      }
      return;
    }
    onClick();
  };

  return (
    <div className={`group relative bg-slate-800/50 [.light-theme_&]:bg-white border ${theme.border} rounded-xl p-8 hover:shadow-xl [.light-theme_&]:hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1 flex flex-col h-full ${!hasAccess ? 'opacity-90' : ''}`}>
      {/* Background gradient overlay */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${theme.overlay} transition-opacity duration-300 pointer-events-none`}
      ></div>

      {/* Plan Badge (Top-Left for Pro/Premium) */}
      {isExclusiveTopic && (
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg shadow-lg ${theme.badge}`}>
            {theme.badgeIcon}
            {theme.badgeText}
          </span>
        </div>
      )}

      {/* Status Badge (Top-Right) */}
      <div className="absolute top-4 right-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 [.light-theme_&]:text-slate-400 py-1 px-2.5 rounded-lg bg-slate-800 [.light-theme_&]:bg-slate-100 border border-slate-700/50 [.light-theme_&]:border-slate-200">
          {percent >= 100 ? 'Done' : percent > 0 ? 'In Progress' : 'New'}
        </span>
      </div>

      {/* Lock Overlay for non-accessible topics */}
      {!hasAccess && (
        <div className="absolute inset-0 bg-slate-900/60 [.light-theme_&]:bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${theme.gradient} flex items-center justify-center mb-3 shadow-lg`}>
              <Lock size={28} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-white [.light-theme_&]:text-slate-700">
              {isProTopic ? 'Pro Only' : 'Premium Only'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="grow flex flex-col justify-center text-center space-y-6">
        {/* Title */}
        <div className={isExclusiveTopic ? 'mt-4' : ''}>
          <h3 className={`text-2xl font-bold text-white [.light-theme_&]:text-slate-900 ${theme.titleHover} transition-colors w-full px-2 leading-tight`}>
            {title}
          </h3>
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-2 max-w-[80%] mx-auto w-full">
          <div className="flex justify-between items-end px-1">
            <span className="text-xs font-medium text-slate-400 [.light-theme_&]:text-slate-500">Progress</span>
            <span className="text-xs font-bold text-white [.light-theme_&]:text-slate-700">{Math.round(percent)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-700 [.light-theme_&]:bg-slate-300 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full ${theme.progressBar} transition-all duration-500 rounded-full shadow-sm`}
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleClick}
        className={`w-full mt-6 py-3 text-sm font-bold rounded-xl text-white shadow-lg
                   ${hasAccess ? theme.button : `bg-gradient-to-r ${theme.gradient}`}
                   active:scale-95 transition-all duration-200`}
      >
        {!hasAccess ? (
          <span className="flex items-center justify-center gap-2">
            <Lock size={16} />
            Upgrade to {isProTopic ? 'Pro' : 'Premium'}
          </span>
        ) : (
          percent > 0 ? 'Continue Lesson' : 'Start Lesson'
        )}
      </button>
    </div>
  );
}

export default TopicCard;