import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Lock, Bell, Palette, Globe, Database, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/user.service';

const SettingsPage = () => {
    const { user } = useAuth();
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

    // Display preferences state
    const [displayPrefs, setDisplayPrefs] = useState({
        theme: 'light',
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
        setDisplayPrefs(prev => ({
            ...prev,
            [key]: value
        }));
        toast.success('Display preferences updated');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-4 sticky top-24">
                        <nav className="space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                            activeTab === tab.id
                                                ? 'bg-green-50 text-green-700 font-semibold'
                                                : 'text-gray-700 hover:bg-gray-50'
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
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-md p-6"
                    >
                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                    <Lock className="text-green-600" size={28} />
                                    Security Settings
                                </h2>

                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                            minLength={6}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? '🔒 Changing Password...' : '🔒 Change Password'}
                                    </button>
                                </form>

                                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                        <Shield size={18} />
                                        Security Tips
                                    </h3>
                                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
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
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                    <Bell className="text-green-600" size={28} />
                                    Notification Preferences
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Email Notifications</h3>
                                            <p className="text-sm text-gray-600">Receive updates via email</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.emailNotifications}
                                                onChange={() => handleNotificationChange('emailNotifications')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Practice Reminders</h3>
                                            <p className="text-sm text-gray-600">Get reminders to practice daily</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.practiceReminders}
                                                onChange={() => handleNotificationChange('practiceReminders')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Achievement Alerts</h3>
                                            <p className="text-sm text-gray-600">Celebrate your milestones</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.achievementAlerts}
                                                onChange={() => handleNotificationChange('achievementAlerts')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Weekly Report</h3>
                                            <p className="text-sm text-gray-600">Receive weekly progress summary</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.weeklyReport}
                                                onChange={() => handleNotificationChange('weeklyReport')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Display Tab */}
                        {activeTab === 'display' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                    <Palette className="text-green-600" size={28} />
                                    Display Settings
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['light', 'dark', 'auto'].map((theme) => (
                                                <button
                                                    key={theme}
                                                    onClick={() => handleDisplayPrefChange('theme', theme)}
                                                    className={`p-4 border-2 rounded-lg capitalize transition-all ${
                                                        displayPrefs.theme === theme
                                                            ? 'border-green-600 bg-green-50 text-green-700 font-semibold'
                                                            : 'border-gray-300 hover:border-gray-400 text-gray-900 bg-white'
                                                    }`}
                                                >
                                                    {theme}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
                                        <select
                                            value={displayPrefs.language}
                                            onChange={(e) => handleDisplayPrefChange('language', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="en">English</option>
                                            <option value="vi">Tiếng Việt</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Font Size</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['small', 'medium', 'large'].map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => handleDisplayPrefChange('fontSize', size)}
                                                    className={`p-4 border-2 rounded-lg capitalize transition-all ${
                                                        displayPrefs.fontSize === size
                                                            ? 'border-green-600 bg-green-50 text-green-700 font-semibold'
                                                            : 'border-gray-300 hover:border-gray-400 text-gray-900 bg-white'
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
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                    <Globe className="text-green-600" size={28} />
                                    Learning Preferences
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty Level</label>
                                        <select
                                            value={learningPrefs.difficultyLevel}
                                            onChange={(e) => handleLearningPrefChange('difficultyLevel', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Daily Goal (minutes): {learningPrefs.dailyGoal}
                                        </label>
                                        <input
                                            type="range"
                                            min="10"
                                            max="120"
                                            step="10"
                                            value={learningPrefs.dailyGoal}
                                            onChange={(e) => handleLearningPrefChange('dailyGoal', parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>10 min</span>
                                            <span>120 min</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Auto-play Audio</h3>
                                            <p className="text-sm text-gray-600">Automatically play pronunciation</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={learningPrefs.autoPlay}
                                                onChange={(e) => handleLearningPrefChange('autoPlay', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Show Hints</h3>
                                            <p className="text-sm text-gray-600">Display helpful hints during exercises</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={learningPrefs.showHints}
                                                onChange={(e) => handleLearningPrefChange('showHints', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Privacy & Data Tab */}
                        {activeTab === 'privacy' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                    <Database className="text-green-600" size={28} />
                                    Privacy & Data Management
                                </h2>

                                <div className="space-y-6">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <h3 className="font-semibold text-gray-800 mb-2">Account Information</h3>
                                        <p className="text-sm text-gray-600 mb-3">Your data is securely stored and encrypted</p>
                                        <div className="space-y-2 text-sm text-gray-900">
                                            <p><span className="font-medium">Email:</span> {user?.email}</p>
                                            <p><span className="font-medium">Account Type:</span> <span className="capitalize">{user?.role || 'Student'}</span></p>
                                            <p><span className="font-medium">Member Since:</span> {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-3">Data Export</h3>
                                        <p className="text-sm text-gray-600 mb-3">Download all your learning data and progress</p>
                                        <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                            📥 Export My Data
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="font-semibold text-red-800 mb-3">Danger Zone</h3>
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                                            <p className="text-sm text-red-700 mb-3">
                                                Once you delete your account, there is no going back. Please be certain.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
                                                        toast.error('Account deletion is currently disabled. Please contact support.');
                                                    }
                                                }}
                                                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                🗑️ Delete My Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
