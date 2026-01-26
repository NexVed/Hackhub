'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import CalendarGrid from '../components/calendar/CalendarGrid';

export default function CalendarPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col h-screen overflow-hidden">
                <TopBar>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Hackathon Calendar
                    </span>
                </TopBar>

                {/* Main content area - takes remaining height */}
                <div className="flex-1 flex min-h-0 bg-zinc-100 dark:bg-zinc-950">
                    {/* Calendar - Main area */}
                    <main className="flex-1 min-h-0 overflow-hidden flex flex-col items-center p-6">
                        <div className="w-full h-full">
                            <CalendarGrid />
                        </div>
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
