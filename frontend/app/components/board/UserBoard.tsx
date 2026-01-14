'use client';

import { UserHackathon } from '../../types/hackathon';
import BoardColumn from './BoardColumn';
import UserHackathonCard from './UserHackathonCard';

interface UserBoardProps {
    hackathons: UserHackathon[];
    isOpen: boolean;
    onToggle: () => void;
    onDragStart: (e: React.DragEvent, hackathon: UserHackathon) => void;
    onDragOver: (e: React.DragEvent, status: UserHackathon['userStatus']) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, status: UserHackathon['userStatus']) => void;
    activeDropZone: UserHackathon['userStatus'] | null;
}

export default function UserBoard({
    hackathons,
    isOpen,
    onToggle,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    activeDropZone,
}: UserBoardProps) {
    const plannedHackathons = hackathons.filter((h) => h.userStatus === 'planned');

    return (
        <>
            {/* Toggle Button - Always visible */}
            <button
                onClick={onToggle}
                className={`fixed top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-3 py-4 rounded-l-xl border border-r-0 transition-all duration-300 shadow-lg ${isOpen
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                style={{ right: isOpen ? '380px' : '0' }}
            >
                <div className="flex flex-col items-center gap-1">
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-xs font-medium" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                        My Hackathons
                    </span>
                    {plannedHackathons.length > 0 && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isOpen ? 'bg-white/20' : 'bg-emerald-500 text-white'
                            }`}>
                            {plannedHackathons.length}
                        </span>
                    )}
                </div>
            </button>

            {/* Slide-out Panel - No backdrop to allow drag through */}
            <div
                className={`fixed right-0 top-0 h-full w-[380px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-out z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">My Hackathons</h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Your participation tracker</p>
                        </div>
                    </div>
                    <button
                        onClick={onToggle}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Empty State */}
                {plannedHackathons.length === 0 && (
                    <div className="p-4">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/50">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-emerald-900 dark:text-emerald-100 mb-1">Get Started</h3>
                                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                        Drag hackathons from the board to add them here.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Planned Column */}
                <div className="p-4 h-[calc(100%-140px)] overflow-y-auto">
                    <BoardColumn
                        title="Planned"
                        count={plannedHackathons.length}
                        accentColor="bg-blue-500"
                        emptyMessage="Drag hackathons here to plan"
                        isDropTarget={activeDropZone === 'planned'}
                        onDragOver={(e) => onDragOver(e, 'planned')}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, 'planned')}
                    >
                        {plannedHackathons.map((hackathon) => (
                            <UserHackathonCard
                                key={hackathon.id}
                                hackathon={hackathon}
                                onDragStart={onDragStart}
                            />
                        ))}
                    </BoardColumn>
                </div>

                {/* Coming Soon Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                        <span className="font-medium">Active</span>, <span className="font-medium">Submitted</span>, and <span className="font-medium">Completed</span> views coming soon
                    </p>
                </div>
            </div>
        </>
    );
}
