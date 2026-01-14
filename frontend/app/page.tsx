'use client';

import { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { TopBar } from './components/TopBar';
import GlobalBoard from './components/board/GlobalBoard';
import UserBoard from './components/board/UserBoard';
import { Hackathon, UserHackathon } from './types/hackathon';

export default function HackathonDashboard() {
  const [userHackathons, setUserHackathons] = useState<UserHackathon[]>([]);
  const [activeDropZone, setActiveDropZone] = useState<UserHackathon['userStatus'] | null>(null);
  const [draggedItem, setDraggedItem] = useState<Hackathon | UserHackathon | null>(null);
  const [isDraggingFromGlobal, setIsDraggingFromGlobal] = useState(false);
  const [isUserBoardOpen, setIsUserBoardOpen] = useState(false);

  // Handle drag start from global board
  const handleGlobalDragStart = useCallback((e: React.DragEvent, hackathon: Hackathon) => {
    setDraggedItem(hackathon);
    setIsDraggingFromGlobal(true);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', hackathon.id);

    // Auto-open user board when dragging
    setIsUserBoardOpen(true);

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  // Handle drag start from user board
  const handleUserDragStart = useCallback((e: React.DragEvent, hackathon: UserHackathon) => {
    setDraggedItem(hackathon);
    setIsDraggingFromGlobal(false);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', hackathon.id);

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  // Handle drag over user board columns
  const handleDragOver = useCallback((e: React.DragEvent, status: UserHackathon['userStatus']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = isDraggingFromGlobal ? 'copy' : 'move';
    setActiveDropZone(status);
  }, [isDraggingFromGlobal]);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setActiveDropZone(null);
    }
  }, []);

  // Handle drop on user board
  const handleDrop = useCallback((e: React.DragEvent, targetStatus: UserHackathon['userStatus']) => {
    e.preventDefault();
    setActiveDropZone(null);

    if (!draggedItem) return;

    if (isDraggingFromGlobal) {
      const alreadyExists = userHackathons.some((h) => h.id === draggedItem.id);
      if (alreadyExists) {
        setUserHackathons((prev) =>
          prev.map((h) =>
            h.id === draggedItem.id ? { ...h, userStatus: targetStatus } : h
          )
        );
      } else {
        const userHackathon: UserHackathon = {
          ...draggedItem as Hackathon,
          userStatus: targetStatus,
          progress: 0,
          milestones: [
            { id: 'm1', title: 'Register for hackathon', completed: false },
            { id: 'm2', title: 'Form team', completed: false },
            { id: 'm3', title: 'Submit project', completed: false },
          ],
        };
        setUserHackathons((prev) => [...prev, userHackathon]);
      }
    } else {
      setUserHackathons((prev) =>
        prev.map((h) =>
          h.id === draggedItem.id
            ? { ...h, userStatus: targetStatus }
            : h
        )
      );
    }

    setDraggedItem(null);
    setIsDraggingFromGlobal(false);
  }, [draggedItem, isDraggingFromGlobal, userHackathons]);

  // Reset drag state
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setActiveDropZone(null);
    setIsDraggingFromGlobal(false);
  }, []);

  // Toggle user board
  const toggleUserBoard = useCallback(() => {
    setIsUserBoardOpen((prev) => !prev);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <div
          className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-auto"
          onDragEnd={handleDragEnd}
        >
          <GlobalBoard onDragStart={handleGlobalDragStart} />
        </div>
      </SidebarInset>

      {/* User board slide-out panel */}
      <UserBoard
        hackathons={userHackathons}
        isOpen={isUserBoardOpen}
        onToggle={toggleUserBoard}
        onDragStart={handleUserDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        activeDropZone={activeDropZone}
      />
    </SidebarProvider>
  );
}
