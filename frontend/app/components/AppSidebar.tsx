'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Globe, Settings, Calendar, Trophy, Users, FolderKanban, ChevronDown, Zap, LogOut, User } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from '@/components/ui/sidebar';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
    },
    {
        title: 'Discover',
        href: '/',
        icon: Globe,
    },
    {
        title: 'My Hackathons',
        href: '/my-hackathons',
        icon: FolderKanban,
    },
    {
        title: 'Calendar',
        href: '/calendar',
        icon: Calendar,
    },
];

const exploreItems = [
    {
        title: 'Teams',
        href: '/teams',
        icon: Users,
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Get user display info
    const userDisplayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Guest';
    const userEmail = user?.email || '';
    const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    const userInitial = userDisplayName.charAt(0).toUpperCase();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                    <Zap className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-bold">HackHub</span>
                                    <span className="text-xs text-muted-foreground">Hackathon Manager</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        isActive={pathname === item.href}
                                        tooltip={item.title}
                                        asChild
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Explore Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>Explore</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {exploreItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={pathname === item.href || (item.href.includes('?') && pathname === '/' && item.href.startsWith('/'))}
                                        asChild
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Settings" asChild>
                            <Link href="/settings">
                                <Settings />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarSeparator className="my-1" />

                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg">
                            {userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt={userDisplayName}
                                    className="flex aspect-square size-8 items-center justify-center rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-medium">
                                    {userInitial}
                                </div>
                            )}
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium">{userDisplayName}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{userEmail}</span>
                            </div>
                            <ChevronDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {user && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Logout"
                                onClick={handleLogout}
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300"
                            >
                                <LogOut />
                                <span>Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}


