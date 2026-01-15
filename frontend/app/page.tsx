'use client';

import { useState, useCallback } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { TopBar } from './components/TopBar';
import DiscoverFeed from './components/board/DiscoverFeed';
import UserBoard from './components/board/UserBoard';
import { UserHackathon } from './types/hackathon';
import { mockHackathons } from './data/mockHackathons';

export default function HackathonDashboard() {
  const [userHackathons, setUserHackathons] = useState<UserHackathon[]>([]);
  const [activeDropZone, setActiveDropZone] = useState<UserHackathon['userStatus'] | null>(null);
  const [draggedItem, setDraggedItem] = useState<UserHackathon | null>(null);
  const [isUserBoardOpen, setIsUserBoardOpen] = useState(false);

  // Handle registration from DiscoverFeed
  const handleRegister = useCallback((hackathonId: string) => {
    // Find the hackathon in mock data
    // In a real app, this would be an API call
    const hackathon = mockHackathons.find(h => h.id === hackathonId);
    if (!hackathon) return;

    setUserHackathons(prev => {
      if (prev.some(h => h.id === hackathonId)) return prev;

      const newUserHackathon: UserHackathon = {
        ...hackathon,
        userStatus: 'planned',
        progress: 0,
        milestones: [
          { id: 'm1', title: 'Register for hackathon', completed: true },
          { id: 'm2', title: 'Form team', completed: false },
          { id: 'm3', title: 'Submit project', completed: false },
        ]
      };
      return [...prev, newUserHackathon];
    });

    setIsUserBoardOpen(true);
  }, []);

  // Handle drag start from user board
  const handleUserDragStart = useCallback((e: React.DragEvent, hackathon: UserHackathon) => {
    setDraggedItem(hackathon);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', hackathon.id);

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  // Handle drag over user board columns
  const handleDragOver = useCallback((e: React.DragEvent, status: UserHackathon['userStatus']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setActiveDropZone(status);
  }, []);

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

    setUserHackathons((prev) =>
      prev.map((h) =>
        h.id === draggedItem.id
          ? { ...h, userStatus: targetStatus }
          : h
      )
    );

    setDraggedItem(null);
  }, [draggedItem]);

  // Reset drag state
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setActiveDropZone(null);
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
        <div className="flex-1 bg-zinc-50 dark:bg-black overflow-auto">
          <DiscoverFeed onRegister={handleRegister} />
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
