'use client';

import { Hackathon } from '../../types/hackathon';
import { getHackathonsByStatus } from '../../data/mockHackathons';
import BoardColumn from './BoardColumn';
import HackathonCard from './HackathonCard';

interface GlobalBoardProps {
    onDragStart: (e: React.DragEvent, hackathon: Hackathon) => void;
}

const columns: { status: Hackathon['status']; title: string; accentColor: string }[] = [
    { status: 'upcoming', title: 'Upcoming', accentColor: 'bg-blue-500' },
    { status: 'live', title: 'Live Now', accentColor: 'bg-green-500' },
    { status: 'ending-soon', title: 'Ending Soon', accentColor: 'bg-orange-500' },
];

export default function GlobalBoard({ onDragStart }: GlobalBoardProps) {
    return (
        <div className="flex flex-col flex-1 min-w-0">
            {/* Board header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Discover Hackathons</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Drag to your board to participate</p>
                    </div>
                </div>
            </div>

            {/* Columns */}
            <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
                {columns.map((col) => {
                    const hackathons = getHackathonsByStatus(col.status);
                    return (
                        <BoardColumn
                            key={col.status}
                            title={col.title}
                            count={hackathons.length}
                            accentColor={col.accentColor}
                        >
                            {hackathons.map((hackathon) => (
                                <HackathonCard
                                    key={hackathon.id}
                                    hackathon={hackathon}
                                    onDragStart={onDragStart}
                                />
                            ))}
                        </BoardColumn>
                    );
                })}
            </div>
        </div>
    );
}
