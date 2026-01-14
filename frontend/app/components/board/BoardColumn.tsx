'use client';

import { ReactNode } from 'react';

interface BoardColumnProps {
    title: string;
    count: number;
    children: ReactNode;
    isDropTarget?: boolean;
    onDragOver?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    emptyMessage?: string;
    accentColor?: string;
}

export default function BoardColumn({
    title,
    count,
    children,
    isDropTarget = false,
    onDragOver,
    onDragLeave,
    onDrop,
    emptyMessage,
    accentColor = 'bg-zinc-500',
}: BoardColumnProps) {
    return (
        <div
            className={`flex flex-col min-w-[280px] max-w-[320px] bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border transition-all duration-200 ${isDropTarget
                    ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg shadow-blue-500/10'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${accentColor}`} />
                    <h3 className="font-medium text-sm text-zinc-700 dark:text-zinc-300">{title}</h3>
                </div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    {count}
                </span>
            </div>

            {/* Cards container */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
                {count === 0 && emptyMessage ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
                    </div>
                ) : (
                    children
                )}
            </div>

            {/* Drop zone indicator */}
            {isDropTarget && (
                <div className="px-3 pb-3">
                    <div className="border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg py-4 flex items-center justify-center bg-blue-50 dark:bg-blue-950/30">
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Drop here to add</span>
                    </div>
                </div>
            )}
        </div>
    );
}
