'use client';

import { useState, useCallback } from 'react';
import { UserHackathonWorkflow } from '../../data/mockUserData';
import WorkflowCard from './WorkflowCard';

interface WorkflowBoardProps {
    hackathons: UserHackathonWorkflow[];
    onUpdateStatus: (id: string, newStatus: UserHackathonWorkflow['status']) => void;
}

const columns: { status: UserHackathonWorkflow['status']; title: string; description: string; accentColor: string }[] = [
    {
        status: 'planned',
        title: 'Planned',
        description: 'Intending to participate',
        accentColor: 'bg-blue-500'
    },
    {
        status: 'active',
        title: 'Active',
        description: 'Currently working on',
        accentColor: 'bg-green-500'
    },
    {
        status: 'completed',
        title: 'Completed',
        description: 'Finished & submitted',
        accentColor: 'bg-purple-500'
    },
];

export default function WorkflowBoard({ hackathons, onUpdateStatus }: WorkflowBoardProps) {
    const [activeDropZone, setActiveDropZone] = useState<UserHackathonWorkflow['status'] | null>(null);
    const [draggedItem, setDraggedItem] = useState<UserHackathonWorkflow | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, hackathon: UserHackathonWorkflow) => {
        setDraggedItem(hackathon);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', hackathon.id);

        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, status: UserHackathonWorkflow['status']) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setActiveDropZone(status);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
            setActiveDropZone(null);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetStatus: UserHackathonWorkflow['status']) => {
        e.preventDefault();
        setActiveDropZone(null);

        if (draggedItem && draggedItem.status !== targetStatus) {
            onUpdateStatus(draggedItem.id, targetStatus);
        }

        setDraggedItem(null);
    }, [draggedItem, onUpdateStatus]);

    const handleDragEnd = useCallback(() => {
        setDraggedItem(null);
        setActiveDropZone(null);
    }, []);

    const getHackathonsByStatus = (status: UserHackathonWorkflow['status']) => {
        return hackathons.filter((h) => h.status === status);
    };

    return (
        <div
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
            onDragEnd={handleDragEnd}
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">My Hackathon Journey</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Drag cards between columns to track your progress</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span>{hackathons.length} hackathons tracked</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {columns.map((col) => {
                    const colHackathons = getHackathonsByStatus(col.status);
                    const isDropTarget = activeDropZone === col.status;

                    return (
                        <div
                            key={col.status}
                            className={`flex flex-col rounded-xl border transition-all duration-200 ${isDropTarget
                                    ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg shadow-blue-500/10'
                                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50'
                                }`}
                            onDragOver={(e) => handleDragOver(e, col.status)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col.status)}
                        >
                            {/* Column header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${col.accentColor}`} />
                                    <div>
                                        <h4 className="font-medium text-sm text-zinc-700 dark:text-zinc-300">{col.title}</h4>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-500">{col.description}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                    {colHackathons.length}
                                </span>
                            </div>

                            {/* Cards container */}
                            <div className="flex-1 p-3 space-y-3 min-h-[200px]">
                                {colHackathons.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-2">
                                            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {col.status === 'planned' && 'Plan your next hackathon'}
                                            {col.status === 'active' && 'Start working on one'}
                                            {col.status === 'completed' && 'Complete a hackathon'}
                                        </p>
                                    </div>
                                ) : (
                                    colHackathons.map((hackathon) => (
                                        <WorkflowCard
                                            key={hackathon.id}
                                            hackathon={hackathon}
                                            onDragStart={handleDragStart}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Drop zone indicator */}
                            {isDropTarget && (
                                <div className="px-3 pb-3">
                                    <div className="border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg py-3 flex items-center justify-center bg-blue-50 dark:bg-blue-950/30">
                                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Drop here</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
