import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Lock, Bell, Palette, Globe, Database, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import userService from '../services/user.service';

const SettingsPage = () => {
    const { user } = useAuth();
    const { theme, setThemeMode } = useTheme();
    const [activeTab, setActiveTab] = useState('security');
    const [loading, setLoading] = useState(false);

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notification preferences state
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        practiceReminders: true,
        achievementAlerts: true,
        weeklyReport: false
    });

    // Display preferences state (theme handled by ThemeContext)
    const [displayPrefs, setDisplayPrefs] = useState({
        language: 'en',
        fontSize: 'medium'
    });

    // Learning preferences state
    const [learningPrefs, setLearningPrefs] = useState({
        difficultyLevel: 'intermediate',
        dailyGoal: 30,
        autoPlay: true,
        showHints: true
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await userService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast.success('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to change password';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        toast.success('Notification preferences updated');
    };

    const handleDisplayPrefChange = (key, value) => {
        if (key === 'theme') {
            // Use ThemeContext for real theme switching
            setThemeMode(value);
            toast.success(`Theme changed to ${value}`);
        } else {
            setDisplayPrefs(prev => ({
                ...prev,
                [key]: value
            }));
            toast.success('Display preferences updated');
        }
    };

    const handleLearningPrefChange = (key, value) => {
        setLearningPrefs(prev => ({
            ...prev,
            [key]: value
        }));
        toast.success('Learning preferences updated');
    };

    const tabs = [
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'display', label: 'Display', icon: Palette },
        { id: 'learning', label: 'Learning', icon: Globe },
        { id: 'privacy', label: 'Privacy & Data', icon: Database }
    ];

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-slate-400 mt-2">Manage your account preferences and settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800 rounded-xl shadow-md p-4 sticky top-24 border border-slate-700">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === tab.id
                                                ? 'bg-brand-primary/20 text-brand-primary font-semibold'
                                                : 'text-slate-300 hover:bg-slate-700'
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div
                            className="bg-slate-800 rounded-xl shadow-md p-6 border border-slate-700"
                        >
                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                        <Lock className="text-brand-primary" size={28} />
                                        Security Settings
                                    </h2>

                                    <form onSubmit={handlePasswordChange} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Current Password <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-600 rounded-lg text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                New Password <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-600 rounded-lg text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                                required
                                                minLength={6}
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Confirm New Password <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-600 rounded-lg text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-3 bg-brand-primary text-slate-900 font-medium rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            {loading ? '🔒 Changing Password...' : '🔒 Change Password'}
                                        </button>
                                    </form>

                                    <div className="mt-8 p-4 bg-brand-tertiary/10 border border-brand-tertiary/30 rounded-lg">
                                        <h3 className="font-semibold text-brand-tertiary mb-2 flex items-center gap-2">
                                            <Shield size={18} />
                                            Security Tips
                                        </h3>
                                        <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                                            <li>Use a strong, unique password</li>
                                            <li>Don't share your password with anyone</li>
                                            <li>Change your password regularly</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                        <Bell className="text-brand-primary" size={28} />
                                        Notification Preferences
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                                            <div>
                                                <h3 className="font-semibold text-white">Email Notifications</h3>
                                                <p className="text-sm text-slate-400">Receive updates via email</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.emailNotifications}
                                                    onChange={() => handleNotificationChange('emailNotifications')}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                                            <div>
                                                <h3 className="font-semibold text-white">Practice Reminders</h3>
                                                <p className="text-sm text-slate-400">Get reminders to practice daily</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.practiceReminders}
                                                    onChange={() => handleNotificationChange('practiceReminders')}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                                            <div>
                                                <h3 className="font-semibold text-white">Achievement Alerts</h3>
                                                <p className="text-sm text-slate-400">Celebrate your milestones</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.achievementAlerts}
                                                    onChange={() => handleNotificationChange('achievementAlerts')}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                                            <div>
                                                <h3 className="font-semibold text-white">Weekly Report</h3>
                                                <p className="text-sm text-slate-400">Receive weekly progress summary</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications.weeklyReport}
                                                    onChange={() => handleNotificationChange('weeklyReport')}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Display Tab */}
                            {activeTab === 'display' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                        <Palette className="text-brand-primary" size={28} />
                                        Display Settings
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['light', 'dark', 'auto'].map((themeOption) => (
                                                    <button
                                                        key={themeOption}
                                                        onClick={() => handleDisplayPrefChange('theme', themeOption)}
                                                        className={`p-4 border-2 rounded-lg capitalize transition-all duration-300 ${theme === themeOption
                                                            ? 'border-brand-primary bg-brand-primary/20 text-brand-primary font-semibold'
                                                            : 'border-slate-600 hover:border-slate-500 text-slate-300 bg-slate-700'
                                                            }`}
                                                    >
                                                        {themeOption}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-3">Language</label>
                                            <select
                                                value={displayPrefs.language}
                                                onChange={(e) => handleDisplayPrefChange('language', e.target.value)}
                                                className="w-full px-4 py-3 border border-slate-600 rounded-lg text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                            >
                                                <option value="en">English</option>
                                                <option value="vi">Tiếng Việt</option>
                                                <option value="es">Español</option>
                                                <option value="fr">Français</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-3">Font Size</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['small', 'medium', 'large'].map((size) => (
                                                    <button
                                                        key={size}
                                                        onClick={() => handleDisplayPrefChange('fontSize', size)}
                                                        className={`p-4 border-2 rounded-lg capitalize transition-all duration-300 ${displayPrefs.fontSize === size
                                                            ? 'border-brand-primary bg-brand-primary/20 text-brand-primary font-semibold'
                                                            : 'border-slate-600 hover:border-slate-500 text-slate-300 bg-slate-700'
                                                            }`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Learning Tab */}
                            {activeTab === 'learning' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                        <Globe className="text-brand-primary" size={28} />
                                        Learning Preferences
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-3">Difficulty Level</label>
                                            <select
                                                value={learningPrefs.difficultyLevel}
                                                onChange={(e) => handleLearningPrefChange('difficultyLevel', e.target.value)}
                                                className="w-full px-4 py-3 border border-slate-600 rounded-lg text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-tertiary focus:border-brand-tertiary transition-all duration-300"
                                            >
                                                <option value="beginner">Beginner</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="advanced">Advanced</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-3">
                                                Daily Goal (minutes): {learningPrefs.dailyGoal}
                                            </label>
                                            <input
                                                type="range"
                                                min="10"
                                                max="120"
                                                step="10"
                                                value={learningPrefs.dailyGoal}
                                                onChange={(e) => handleLearningPrefChange('dailyGoal', parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>10 min</span>
                                                <span>120 min</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                                            <div>
                                                <h3 className="font-semibold text-white">Auto-play Audio</h3>
                                                <p className="text-sm text-slate-400">Automatically play pronunciation</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={learningPrefs.autoPlay}
                                                    onChange={(e) => handleLearningPrefChange('autoPlay', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                                            <div>
                                                <h3 className="font-semibold text-white">Show Hints</h3>
                                                <p className="text-sm text-slate-400">Display helpful hints during exercises</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={learningPrefs.showHints}
                                                    onChange={(e) => handleLearningPrefChange('showHints', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Privacy & Data Tab */}
                            {activeTab === 'privacy' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                        <Database className="text-brand-primary" size={28} />
                                        Privacy & Data Management
                                    </h2>

                                    <div className="space-y-6">
                                        <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                                            <h3 className="font-semibold text-white mb-2">Account Information</h3>
                                            <p className="text-sm text-slate-400 mb-3">Your data is securely stored and encrypted</p>
                                            <div className="space-y-2 text-sm text-slate-300">
                                                <p><span className="font-medium text-slate-200">Email:</span> {user?.email}</p>
                                                <p><span className="font-medium text-slate-200">Account Type:</span> <span className="capitalize">{user?.role || 'Student'}</span></p>
                                                <p><span className="font-medium text-slate-200">Member Since:</span> {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-white mb-3">Data Export</h3>
                                            <p className="text-sm text-slate-400 mb-3">Download all your learning data and progress</p>
                                            <button className="px-6 py-3 bg-brand-tertiary text-slate-900 font-medium rounded-lg hover:bg-brand-tertiary-dark transition-all duration-300">
                                                📥 Export My Data
                                            </button>
                                        </div>

                                        <div className="border-t border-slate-600 pt-6">
                                            <h3 className="font-semibold text-red-400 mb-3">Danger Zone</h3>
                                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                <h4 className="font-medium text-red-400 mb-2">Delete Account</h4>
                                                <p className="text-sm text-red-300/80 mb-3">
                                                    Once you delete your account, there is no going back. Please be certain.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
                                                            toast.error('Account deletion is currently disabled. Please contact support.');
                                                        }
                                                    }}
                                                    className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all duration-300"
                                                >
                                                    🗑️ Delete My Account
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
