// XP and Level Utility Functions

/**
 * XP Rewards Configuration
 */
export const XP_REWARDS = {
    LESSON_COMPLETE: 10,      // Hoàn thành 1 bài học
    STREAK_BONUS: 5,          // Đúng liên tiếp
    DAILY_TASK: 20,           // Hoàn thành nhiệm vụ ngày
    PERFECT_SCORE: 15,        // Điểm tuyệt đối (100%)
    FIRST_LESSON: 25,         // Bài học đầu tiên trong ngày
};

/**
 * Level Titles Configuration
 */
export const LEVEL_TITLES = [
    { minLevel: 1, maxLevel: 4, title: 'Newbie', titleVi: 'Mầm non', emoji: '🌱', color: 'from-green-400 to-green-600' },
    { minLevel: 5, maxLevel: 9, title: 'Explorer', titleVi: 'Người khám phá', emoji: '🧭', color: 'from-blue-400 to-blue-600' },
    { minLevel: 10, maxLevel: 19, title: 'Learner', titleVi: 'Người học', emoji: '📚', color: 'from-purple-400 to-purple-600' },
    { minLevel: 20, maxLevel: 29, title: 'Achiever', titleVi: 'Người thành đạt', emoji: '🏆', color: 'from-yellow-400 to-yellow-600' },
    { minLevel: 30, maxLevel: 39, title: 'Expert', titleVi: 'Chuyên gia', emoji: '💎', color: 'from-cyan-400 to-cyan-600' },
    { minLevel: 40, maxLevel: 49, title: 'Master', titleVi: 'Bậc thầy', emoji: '👑', color: 'from-orange-400 to-orange-600' },
    { minLevel: 50, maxLevel: Infinity, title: 'Legend', titleVi: 'Huyền thoại', emoji: '⭐', color: 'from-pink-500 to-purple-600' },
];

/**
 * Calculate XP required to reach a specific level
 * Formula: XP needed = Level * 100
 * Total XP for Level N = Sum of (1 to N) * 100 = N*(N+1)/2 * 100
 */
export const getXPForLevel = (level) => {
    return level * 100;
};

/**
 * Calculate total XP needed to reach a level from scratch
 * Level 1: 100 XP
 * Level 2: 100 + 200 = 300 XP
 * Level 3: 300 + 300 = 600 XP
 */
export const getTotalXPForLevel = (level) => {
    return (level * (level + 1)) / 2 * 100;
};

/**
 * Calculate current level from total XP
 * Reverse the formula: level = (-1 + sqrt(1 + 8*xp/100)) / 2
 */
export const getLevelFromXP = (totalXP) => {
    if (totalXP < 100) return 1;
    // Solve: level * (level + 1) / 2 * 100 <= totalXP
    const level = Math.floor((-1 + Math.sqrt(1 + 8 * totalXP / 100)) / 2);
    return Math.max(1, level);
};

/**
 * Get level progress info
 */
export const getLevelProgress = (totalXP) => {
    const currentLevel = getLevelFromXP(totalXP);
    const xpForCurrentLevel = getTotalXPForLevel(currentLevel);
    const xpForNextLevel = getTotalXPForLevel(currentLevel + 1);
    const xpInCurrentLevel = totalXP - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

    return {
        currentLevel,
        totalXP,
        xpInCurrentLevel,
        xpNeededForNextLevel,
        xpForNextLevel,
        progressPercent
    };
};

/**
 * Get level title info
 */
export const getLevelTitle = (level) => {
    const titleInfo = LEVEL_TITLES.find(
        t => level >= t.minLevel && level <= t.maxLevel
    ) || LEVEL_TITLES[0];

    return {
        ...titleInfo,
        level
    };
};

/**
 * Get complete level info from XP
 */
export const getLevelInfo = (totalXP) => {
    const progress = getLevelProgress(totalXP);
    const titleInfo = getLevelTitle(progress.currentLevel);

    return {
        ...progress,
        ...titleInfo
    };
};

export default {
    XP_REWARDS,
    LEVEL_TITLES,
    getXPForLevel,
    getTotalXPForLevel,
    getLevelFromXP,
    getLevelProgress,
    getLevelTitle,
    getLevelInfo
};
