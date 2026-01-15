'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import CalendarGrid from '../components/calendar/CalendarGrid';
import FlagshipSidebar from '../components/calendar/FlagshipSidebar';

export default function CalendarPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TopBar>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Hackathon Calendar
                    </span>
                </TopBar>

                {/* Main content area with two-column layout */}
                <div className="flex-1 flex overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                    {/* Calendar - Main area */}
                    <main className="flex-1 overflow-hidden">
                        <CalendarGrid />
                    </main>

                    {/* Featured Hackathons - Right sidebar */}
                    <FlagshipSidebar />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
