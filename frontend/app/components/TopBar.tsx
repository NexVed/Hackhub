'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggle from './ThemeToggle';

interface TopBarProps {
    children?: React.ReactNode;
}

const pageTitles: Record<string, string> = {
    '/': 'Discover Hackathons',
    '/dashboard': 'Dashboard',
    '/my-hackathons': 'My Hackathons',
    '/calendar': 'Calendar',
};

export function TopBar({ children }: TopBarProps) {
    const pathname = usePathname();
    const title = pageTitles[pathname] || 'HackkyHub';

    return (
        <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-sidebar-border bg-background px-4">
            {/* Sidebar toggle */}
            <SidebarTrigger className="-ml-1" />

            {/* Separator */}
            <div className="h-4 w-px bg-border" />

            {/* Page title */}
            <div className="flex-1">
                <h1 className="font-semibold text-lg">{title}</h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden md:inline-block">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <ThemeToggle />
                {children}
            </div>
        </header>
    );
}
