import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePremium, PREMIUM_PLANS } from '../context/PremiumContext';
import userService from '../services/user.service';
import StatCard from '../components/StatCard';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const { subscription, isPremium, isPro, currentPlan, loading: premiumLoading, cancelSubscription, cancelScheduledChange, hasScheduledChange, scheduledPlanInfo, refreshSubscription } = usePremium();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelScheduledLoading, setCancelScheduledLoading] = useState(false);
    const fullNameInputRef = useRef(null);

    const [profileData, setProfileData] = useState(null);
    const [stats, setStats] = useState({
        currentStreak: 0,
        totalPracticeSeconds: 0,
        averageScore: 0,
        lastPracticeDate: null
    });
    const [progressData, setProgressData] = useState({
        totalExercises: 0,
        completedExercises: 0,
        topicsCovered: 0
    });

    const [profileFormData, setProfileFormData] = useState({
        fullName: ''
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [profileRes, statsRes, progressRes] = await Promise.all([
                userService.getProfile(),
                userService.getUserStats(),
                userService.getUserProgress()
            ]);

            if (profileRes.success && profileRes.data) {
                setProfileData(profileRes.data);
                setProfileFormData({
                    fullName: profileRes.data.fullName || ''
                });
            }

            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }

            if (progressRes.status === 'success' && progressRes.data) {
                const { summary, topics } = progressRes.data;
                setProgressData({
                    totalExercises: summary?.totalExercises || 0,
                    completedExercises: summary?.completedExercises || 0,
                    topicsCovered: topics?.length || 0
                });
            }

        } catch (error) {
            console.error('Failed to load profile data:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        setProfileFormData({
            ...profileFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleStartEditProfile = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();

        setProfileFormData({
            fullName: profileData?.fullName || user?.fullName || ''
        });

        setIsEditingProfile(true);

        setTimeout(() => {
            fullNameInputRef.current?.focus?.();
            fullNameInputRef.current?.select?.();
        }, 0);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if ((profileData?.fullName || '') === (profileFormData.fullName || '')) {
            setIsEditingProfile(false);
            return;
        }

        setSaving(true);
        try {
            await userService.updateProfile({ fullName: profileFormData.fullName });

            updateUser({ ...user, fullName: profileFormData.fullName });
            setProfileData(prev => ({ ...prev, fullName: profileFormData.fullName }));
            toast.success('Profile updated successfully');
            setIsEditingProfile(false);
        } catch (error) {
            console.error('Update error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleCancelProfile = () => {
        setIsEditingProfile(false);
        setProfileFormData({
            fullName: profileData?.fullName || ''
        });
    };

    const formatTime = (seconds) => {
        if (!seconds) return "0 mins";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} mins`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">My Profile</h1>
                    <p className="text-slate-400 mt-2">Manage your account settings and view your learning statistics</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        label="Current Streak"
                        value={`${stats.currentStreak} days`}
                        description="Keep practicing daily!"
                        color="primary"
                    />
                    <StatCard
                        label="Total Practice Time"
                        value={formatTime(stats.totalPracticeSeconds)}
                        description="Time spent learning"
                        color="secondary"
                    />
                    <StatCard
                        label="Average Score"
                        value={`${Math.round(stats.averageScore)}%`}
                        description="Across all exercises"
                        color="tertiary"
                    />
                </div>

                {/* Profile Information Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-800 rounded-xl shadow-md overflow-hidden mb-6 border border-slate-700"
                >
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-brand-primary font-bold text-4xl shadow-lg border-4 border-white/20">
                                {((profileData?.fullName || user?.fullName || 'U').charAt(0) || 'U').toUpperCase()}
                            </div>
                            <div className="text-slate-900">
                                <h2 className="text-2xl font-bold">{profileData?.fullName || user?.fullName || 'User'}</h2>
                                <p className="text-slate-800 mt-1">{profileData?.email || user?.email}</p>
                                <div className="flex gap-2 mt-3">
                                    <div className="inline-block px-3 py-1 bg-slate-900/30 rounded-full text-sm font-medium text-white">
                                        {profileData?.role === 'admin' || user?.role === 'admin' ? '👑 Admin' : '🎓 Student'}
                                    </div>
                                    <div className="inline-block px-3 py-1 bg-slate-900/30 rounded-full text-sm font-medium text-white">
                                        ✅ Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleUpdateProfile}>
                            {/* Basic Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="text-2xl">👤</span>
                                    Basic Information
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Full Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={profileFormData.fullName}
                                            onChange={handleProfileChange}
                                            disabled={!isEditingProfile}
                                            ref={fullNameInputRef}
                                            className="w-full px-4 py-3 border border-slate-600 rounded-lg text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-tertiary disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData?.email || user?.email || ''}
                                            disabled
                                            className="w-full px-4 py-3 border border-slate-600 rounded-lg text-slate-400 bg-slate-800 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">📧 Email cannot be changed</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Member Since
                                            </label>
                                            <input
                                                type="text"
                                                value={formatDate(profileData?.createdAt || user?.createdAt)}
                                                disabled
                                                className="w-full px-4 py-3 border border-slate-600 rounded-lg text-slate-400 bg-slate-800 cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Last Updated
                                            </label>
                                            <input
                                                type="text"
                                                value={formatDate(profileData?.updatedAt || user?.updatedAt)}
                                                disabled
                                                className="w-full px-4 py-3 border border-slate-600 rounded-lg text-slate-400 bg-slate-800 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons for Profile */}
                            <div className="flex gap-4">
                                {!isEditingProfile ? (
                                    <button
                                        type="button"
                                        onClick={handleStartEditProfile}
                                        disabled={saving}
                                        className="px-6 py-3 bg-brand-primary text-slate-900 font-medium rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-300 shadow-sm"
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-6 py-3 bg-brand-primary text-slate-900 font-medium rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                                        >
                                            {saving ? '💾 Saving...' : '💾 Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelProfile}
                                            disabled={saving}
                                            className="px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            ❌ Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Learning Statistics Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-slate-800 rounded-xl shadow-md p-6 mb-6 border border-slate-700"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        Learning Statistics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-lg">
                            <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-slate-900 text-xl">
                                ✅
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Completed</p>
                                <p className="text-2xl font-bold text-brand-primary">{progressData.completedExercises}</p>
                                <p className="text-xs text-slate-500">exercises</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-brand-tertiary/10 border border-brand-tertiary/30 rounded-lg">
                            <div className="w-12 h-12 bg-brand-tertiary rounded-full flex items-center justify-center text-slate-900 text-xl">
                                📝
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Total Exercises</p>
                                <p className="text-2xl font-bold text-brand-tertiary">{progressData.totalExercises}</p>
                                <p className="text-xs text-slate-500">attempted</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                                📚
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Topics Covered</p>
                                <p className="text-2xl font-bold text-purple-400">{progressData.topicsCovered}</p>
                                <p className="text-xs text-slate-500">different topics</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-brand-secondary/10 border border-brand-secondary/30 rounded-lg">
                            <div className="w-12 h-12 bg-brand-secondary rounded-full flex items-center justify-center text-slate-900 text-xl">
                                🔥
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">Streak</p>
                                <p className="text-2xl font-bold text-brand-secondary">{stats.currentStreak}</p>
                                <p className="text-xs text-slate-500">day{stats.currentStreak !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Account Information Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-slate-800 rounded-xl shadow-md p-6 border border-slate-700"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">ℹ️</span>
                        Account Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                            <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary text-lg">
                                ✅
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Account Status</p>
                                <p className="font-semibold text-white">Active</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                            <div className="w-10 h-10 bg-brand-tertiary/20 rounded-full flex items-center justify-center text-brand-tertiary text-lg">
                                🎭
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Role</p>
                                <p className="font-semibold text-white capitalize">
                                    {profileData?.role || user?.role || 'Student'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-lg">
                                ⏱️
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Last Practice</p>
                                <p className="font-semibold text-white">
                                    {stats.lastPracticeDate ? formatDate(stats.lastPracticeDate) : 'Never'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                            <div className="w-10 h-10 bg-brand-secondary/20 rounded-full flex items-center justify-center text-brand-secondary text-lg">
                                📅
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Member Since</p>
                                <p className="font-semibold text-white">
                                    {formatDate(profileData?.createdAt || user?.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Subscription Status Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-700 mt-6"
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span className="text-2xl">📦</span>
                                Your Plan
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                isPro 
                                    ? 'bg-purple-500/30 text-purple-300' 
                                    : isPremium 
                                        ? 'bg-emerald-500/30 text-emerald-300'
                                        : 'bg-slate-600/50 text-slate-300'
                            }`}>
                                {isPro ? '👑 Pro Member' : isPremium ? '⭐ Premium Member' : '🆓 Free User'}
                            </span>
                        </div>

                        {/* All Plans Display */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* Free Plan */}
                            <div className={`relative p-4 rounded-xl border-2 transition-all ${
                                !isPremium && !isPro
                                    ? 'border-slate-400 bg-slate-700/80 ring-2 ring-slate-400/50'
                                    : 'border-slate-700 bg-slate-800/50 opacity-60'
                            }`}>
                                {!isPremium && !isPro && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-3 py-1 bg-slate-500 text-white text-xs font-bold rounded-full">
                                            CURRENT
                                        </span>
                                    </div>
                                )}
                                <div className="text-center pt-2">
                                    <div className="text-3xl mb-2">🆓</div>
                                    <h4 className="text-lg font-bold text-white">Free</h4>
                                    <p className="text-2xl font-bold text-white mt-2">$0</p>
                                    <p className="text-xs text-slate-400">forever</p>
                                </div>
                                <ul className="mt-4 space-y-2">
                                    {PREMIUM_PLANS.FREE.features.slice(0, 4).map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                            <svg className="w-3 h-3 mt-0.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Premium Plan */}
                            <div className={`relative p-4 rounded-xl border-2 transition-all ${
                                isPremium && !isPro
                                    ? 'border-emerald-500 bg-gradient-to-b from-emerald-900/50 to-green-900/50 ring-2 ring-emerald-500/50'
                                    : 'border-slate-700 bg-slate-800/50'
                            } ${isPro ? 'opacity-60' : ''}`}>
                                {isPremium && !isPro && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                                            CURRENT
                                        </span>
                                    </div>
                                )}
                                <div className="text-center pt-2">
                                    <div className="text-3xl mb-2">⭐</div>
                                    <h4 className="text-lg font-bold text-white">Premium</h4>
                                    <p className="text-2xl font-bold text-emerald-400 mt-2">${PREMIUM_PLANS.PREMIUM.price}</p>
                                    <p className="text-xs text-slate-400">/month</p>
                                </div>
                                <ul className="mt-4 space-y-2">
                                    {PREMIUM_PLANS.PREMIUM.features.slice(0, 4).map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                            <svg className="w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Pro Plan */}
                            <div className={`relative p-4 rounded-xl border-2 transition-all ${
                                isPro
                                    ? 'border-purple-500 bg-gradient-to-b from-purple-900/50 to-pink-900/50 ring-2 ring-purple-500/50'
                                    : 'border-slate-700 bg-slate-800/50'
                            }`}>
                                {isPro && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                                            CURRENT
                                        </span>
                                    </div>
                                )}
                                <div className="text-center pt-2">
                                    <div className="text-3xl mb-2">👑</div>
                                    <h4 className="text-lg font-bold text-white">Pro</h4>
                                    <p className="text-2xl font-bold text-purple-400 mt-2">${PREMIUM_PLANS.PRO.price}</p>
                                    <p className="text-xs text-slate-400">/month</p>
                                </div>
                                <ul className="mt-4 space-y-2">
                                    {PREMIUM_PLANS.PRO.features.slice(0, 4).map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                            <svg className="w-3 h-3 mt-0.5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Subscription Info */}
                        {(isPremium || isPro) && subscription?.endDate && (
                            <div className={`p-4 rounded-lg mb-6 ${isPro ? 'bg-purple-500/10' : 'bg-emerald-500/10'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${
                                            subscription?.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'
                                        }`}></span>
                                        <span className="text-sm text-slate-300">
                                            Status: <span className="font-semibold text-white capitalize">{subscription?.status || 'Active'}</span>
                                            {subscription?.cancelAtPeriodEnd && (
                                                <span className="ml-2 text-yellow-400">(Đã hủy)</span>
                                            )}
                                        </span>
                                    </div>
                                    <span className="text-sm text-slate-400">
                                        {subscription.cancelAtPeriodEnd ? 'Hết hạn' : 'Gia hạn'}: {formatDate(subscription.endDate)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Cancelled Notice */}
                        {(isPremium || isPro) && subscription?.cancelAtPeriodEnd && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-yellow-400 text-lg">⚠️</span>
                                    <div>
                                        <p className="text-yellow-300 font-semibold text-sm">Gói đăng ký đã được hủy</p>
                                        <p className="text-yellow-200/70 text-xs">
                                            Bạn vẫn có thể sử dụng tất cả tính năng đến ngày {formatDate(subscription?.endDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scheduled Change Notice */}
                        {(isPremium || isPro) && hasScheduledChange && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-blue-400 text-lg">📅</span>
                                    <div className="flex-1">
                                        <p className="text-blue-300 font-semibold text-sm">Đã lên lịch chuyển đổi gói</p>
                                        <p className="text-blue-200/70 text-xs">
                                            Bạn sẽ chuyển sang gói <span className="font-bold capitalize">{scheduledPlanInfo?.plan}</span> vào ngày {formatDate(scheduledPlanInfo?.changeDate)}. 
                                            Đến lúc đó, bạn vẫn được sử dụng đầy đủ tính năng hiện tại.
                                        </p>
                                        <button
                                            onClick={async () => {
                                                if (!window.confirm('Bạn có chắc muốn hủy lịch chuyển đổi gói?')) return;
                                                setCancelScheduledLoading(true);
                                                try {
                                                    await cancelScheduledChange();
                                                    await refreshSubscription();
                                                    toast.success('Đã hủy lịch chuyển đổi gói!');
                                                } catch (error) {
                                                    toast.error(error.message || 'Không thể hủy lịch chuyển đổi');
                                                } finally {
                                                    setCancelScheduledLoading(false);
                                                }
                                            }}
                                            disabled={cancelScheduledLoading}
                                            className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {cancelScheduledLoading ? 'Đang hủy...' : '✕ Hủy lịch chuyển đổi'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-center">
                            {!isPro && !isPremium && (
                                <Link
                                    to="/premium"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Upgrade to Premium
                                </Link>
                            )}
                            
                            {isPremium && !isPro && !subscription?.cancelAtPeriodEnd && (
                                <Link
                                    to="/premium"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    Upgrade to Pro
                                </Link>
                            )}

                            {/* Manage & Cancel Buttons for subscribers */}
                            {(isPremium || isPro) && !subscription?.cancelAtPeriodEnd && (
                                <>
                                    <Link
                                        to="/premium"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Manage Subscription
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm('Bạn có chắc muốn hủy gói đăng ký? Bạn vẫn có thể sử dụng đến hết kỳ thanh toán.')) {
                                                return;
                                            }
                                            setCancelLoading(true);
                                            try {
                                                await cancelSubscription();
                                                await refreshSubscription();
                                                toast.success('Đã hủy gói đăng ký thành công!');
                                            } catch (error) {
                                                toast.error(error.message || 'Không thể hủy gói đăng ký');
                                            } finally {
                                                setCancelLoading(false);
                                            }
                                        }}
                                        disabled={cancelLoading}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {cancelLoading ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Đang hủy...
                                            </>
                                        ) : (
                                            <>🚫 Hủy gói</>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;
