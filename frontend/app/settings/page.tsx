'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { User, Bell, Shield, Palette, Link2, LucideIcon } from 'lucide-react';

type TextSetting = { label: string; value: string; type: 'text' | 'email' | 'textarea' };
type ToggleSetting = { label: string; type: 'toggle'; enabled: boolean };
type SelectSetting = { label: string; type: 'select'; options: string[]; value: string };
type Setting = TextSetting | ToggleSetting | SelectSetting;

interface Integration {
    name: string;
    connected: boolean;
    icon: string;
}

interface SettingsSection {
    id: string;
    title: string;
    icon: LucideIcon;
    description: string;
    settings?: Setting[];
    integrations?: Integration[];
}

const settingsSections: SettingsSection[] = [
    {
        id: 'account',
        title: 'Account',
        icon: User,
        description: 'Manage your profile and preferences',
        settings: [
            { label: 'Display Name', value: 'Alex Chen', type: 'text' },
            { label: 'Username', value: '@alexcodes', type: 'text' },
            { label: 'Email', value: 'alex@example.com', type: 'email' },
            { label: 'Bio', value: 'Full-stack developer passionate about building products that matter.', type: 'textarea' },
        ],
    },
    {
        id: 'notifications',
        title: 'Notifications',
        icon: Bell,
        description: 'Configure how you receive updates',
        settings: [
            { label: 'Email Notifications', type: 'toggle', enabled: true },
            { label: 'Push Notifications', type: 'toggle', enabled: false },
            { label: 'Hackathon Reminders', type: 'toggle', enabled: true },
            { label: 'Team Updates', type: 'toggle', enabled: true },
        ],
    },
    {
        id: 'integrations',
        title: 'Integrations',
        icon: Link2,
        description: 'Connect your accounts',
        integrations: [
            { name: 'GitHub', connected: true, icon: '🔗' },
            { name: 'LinkedIn', connected: true, icon: '💼' },
            { name: 'Discord', connected: false, icon: '💬' },
            { name: 'Slack', connected: false, icon: '📱' },
        ],
    },
    {
        id: 'appearance',
        title: 'Appearance',
        icon: Palette,
        description: 'Customize the look and feel',
        settings: [
            { label: 'Theme', type: 'select', options: ['System', 'Light', 'Dark'], value: 'System' },
            { label: 'Compact Mode', type: 'toggle', enabled: false },
        ],
    },
];


export default function SettingsPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TopBar>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Settings
                    </span>
                </TopBar>

                <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-auto">
                    <div className="max-w-4xl mx-auto p-6 space-y-6">
                        {settingsSections.map((section) => {
                            const SectionIcon = section.icon;

                            return (
                                <div
                                    key={section.id}
                                    className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                                >
                                    {/* Section Header */}
                                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                                <SectionIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div>
                                                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {section.title}
                                                </h2>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    {section.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Content */}
                                    <div className="p-6 space-y-4">
                                        {section.settings?.map((setting, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                    {setting.label}
                                                </label>
                                                {setting.type === 'text' || setting.type === 'email' ? (
                                                    <input
                                                        type={setting.type}
                                                        defaultValue={setting.value}
                                                        className="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                    />
                                                ) : setting.type === 'textarea' ? (
                                                    <textarea
                                                        defaultValue={setting.value}
                                                        rows={2}
                                                        className="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                                                    />
                                                ) : setting.type === 'toggle' ? (
                                                    <button
                                                        className={`relative w-11 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                ) : setting.type === 'select' ? (
                                                    <select
                                                        defaultValue={setting.value}
                                                        className="px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                    >
                                                        {setting.options?.map((opt) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : null}
                                            </div>
                                        ))}

                                        {section.integrations?.map((integration, index) => (
                                            <div key={index} className="flex items-center justify-between py-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{integration.icon}</span>
                                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                        {integration.name}
                                                    </span>
                                                </div>
                                                <button
                                                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${integration.connected
                                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300'
                                                        }`}
                                                >
                                                    {integration.connected ? 'Connected' : 'Connect'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Danger Zone */}
                        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 overflow-hidden">
                            <div className="px-6 py-4 border-b border-red-200 dark:border-red-900">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                                        <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-red-900 dark:text-red-100">
                                            Danger Zone
                                        </h2>
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            Irreversible actions
                                        </p>
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
