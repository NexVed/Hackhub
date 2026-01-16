'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { User, Bell, Palette, Link2, Shield, Save, Loader2, Check } from 'lucide-react';
import { GitHubDark, LinkedIn, XDark, Instagram, ThreadsDark } from '@ridemountainpig/svgl-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '@/lib/profileService';

interface SocialLink {
    key: string;
    label: string;
    placeholder: string;
    icon: React.ReactNode;
}

const socialLinks: SocialLink[] = [
    { key: 'social_github', label: 'GitHub', placeholder: 'https://github.com/username', icon: <GitHubDark className="w-5 h-5" /> },
    { key: 'social_linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', icon: <LinkedIn className="w-5 h-5" /> },
    { key: 'social_twitter', label: 'X (Twitter)', placeholder: 'https://x.com/username', icon: <XDark className="w-5 h-5" /> },
    { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/username', icon: <Instagram className="w-5 h-5" /> },
    { key: 'social_threads', label: 'Threads', placeholder: 'https://threads.net/@username', icon: <ThreadsDark className="w-5 h-5" /> },
];

export default function SettingsPage() {
    const { user, profile, loading: authLoading, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        bio: '',
        headline: '',
        social_github: '',
        social_linkedin: '',
        social_twitter: '',
        social_instagram: '',
        social_threads: '',
    });

    // Notification settings (local state for now)
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        hackathonReminders: true,
        teamUpdates: true,
    });

    // Appearance settings (local state for now)
    const [theme, setTheme] = useState('System');
    const [compactMode, setCompactMode] = useState(false);

    // Load profile data on mount
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                username: profile.username || '',
                bio: profile.bio || '',
                headline: profile.headline || '',
                social_github: profile.social_github || '',
                social_linkedin: profile.social_linkedin || '',
                social_twitter: profile.social_twitter || '',
                social_instagram: profile.social_instagram || '',
                social_threads: profile.social_threads || '',
            });
        }
    }, [profile]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = async () => {
        if (!user?.id) return;

        setSaving(true);
        try {
            const result = await updateUserProfile(user.id, formData);
            if (result.success) {
                setSaved(true);
                // Refresh profile in background (non-blocking)
                refreshProfile?.();
                setTimeout(() => setSaved(false), 3000);
            } else {
                console.error('Failed to save:', result.error);
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <TopBar>
                        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Settings</span>
                    </TopBar>
                    <div className="flex-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TopBar>
                    <div className="flex items-center justify-between w-full">
                        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Settings</span>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                </TopBar>

                <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-auto">
                    <div className="max-w-4xl mx-auto p-6 space-y-6">
                        {/* Account Section */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                        <User className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Account</h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your profile information</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Display Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Username</label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => handleInputChange('username', e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Headline</label>
                                    <input
                                        type="text"
                                        value={formData.headline}
                                        onChange={(e) => handleInputChange('headline', e.target.value)}
                                        placeholder="e.g. Full-stack Developer | AI Enthusiast"
                                        className="w-full px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        rows={3}
                                        placeholder="Tell us about yourself..."
                                        className="w-full px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Links Section */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                        <Link2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Social Links</h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Connect your social profiles</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {socialLinks.map((social) => (
                                    <div key={social.key} className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                            {social.icon}
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                                {social.label}
                                            </label>
                                            <input
                                                type="url"
                                                value={formData[social.key as keyof typeof formData]}
                                                onChange={(e) => handleInputChange(social.key, e.target.value)}
                                                placeholder={social.placeholder}
                                                className="w-full px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notifications Section */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                        <Bell className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Notifications</h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Configure how you receive updates</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {[
                                    { key: 'email', label: 'Email Notifications' },
                                    { key: 'push', label: 'Push Notifications' },
                                    { key: 'hackathonReminders', label: 'Hackathon Reminders' },
                                    { key: 'teamUpdates', label: 'Team Updates' },
                                ].map((toggle) => (
                                    <div key={toggle.key} className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{toggle.label}</span>
                                        <button
                                            onClick={() => setNotifications(prev => ({ ...prev, [toggle.key]: !prev[toggle.key as keyof typeof notifications] }))}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${notifications[toggle.key as keyof typeof notifications] ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[toggle.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Appearance Section */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                        <Palette className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Appearance</h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Customize the look and feel</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Theme</span>
                                    <select
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                        <option value="System">System</option>
                                        <option value="Light">Light</option>
                                        <option value="Dark">Dark</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Compact Mode</span>
                                    <button
                                        onClick={() => setCompactMode(!compactMode)}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${compactMode ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${compactMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 overflow-hidden">
                            <div className="px-6 py-4 border-b border-red-200 dark:border-red-900">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                                        <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-red-900 dark:text-red-100">Danger Zone</h2>
                                        <p className="text-sm text-red-600 dark:text-red-400">Irreversible actions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-900 dark:text-red-100">Delete Account</p>
                                    <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and all data</p>
                                </div>
                                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
