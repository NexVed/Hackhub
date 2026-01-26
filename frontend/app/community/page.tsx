'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/AppSidebar';
import { TopBar } from '../components/TopBar';
import { MessageSquare, Heart, Share2, MoreHorizontal, Search, Sparkles, Filter, Plus, Users, Hash, Zap, Code2, Trophy, LineChart, Loader2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPosts, createPost, toggleLike, getComments, addComment, Post, Comment } from '../../lib/communityService';

// Time Ago Helper
function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

// Mock Data for the Community Page
const CATEGORIES = [
    { name: 'All', icon: Sparkles },
    { name: 'Discussions', icon: MessageSquare },
    { name: 'Team Finding', icon: Users },
    { name: 'Showcase', icon: Trophy },
    { name: 'Resources', icon: Code2 },
];

const TRENDING_TOPICS = [
    { name: 'AI Agents', count: '1.2k', trend: '+12%' },
    { name: 'HackThisFall', count: '856', trend: '+5%' },
    { name: 'Web3 Dev', count: '645', trend: 'New' },
    { name: 'Open Source', count: '432', trend: '+8%' },
];

const TRENDING_HACKATHONS = [
    { name: 'HackThisFall 2024', trackers: 856, platform: 'Devfolio', daysLeft: '5 days' },
    { name: 'Smart India Hackathon', trackers: 645, platform: 'Gov', daysLeft: '12 days' },
    { name: 'ETHIndia', trackers: 432, platform: 'Devfolio', daysLeft: '1 month' },
    { name: 'Global AI Challenge', trackers: 310, platform: 'Unstop', daysLeft: '2 weeks' },
];

export default function CommunityPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('All');
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    // Expanded Post State for comments
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [commentInput, setCommentInput] = useState('');

    useEffect(() => {
        loadPosts();
    }, [activeTab]);

    const loadPosts = async () => {
        setIsLoading(true);
        const fetchedPosts = await getPosts(activeTab);
        setPosts(fetchedPosts);
        setIsLoading(false);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        setIsPosting(true);
        const newPost = await createPost(newPostContent, activeTab === 'All' ? 'Discussions' : activeTab);
        if (newPost) {
            setPosts([newPost, ...posts]);
            setNewPostContent('');
        }
        setIsPosting(false);
    };

    const handleLike = async (postId: string) => {
        // Optimistic update
        setPosts(posts.map(p => {
            if (p.id === postId) {
                // If we tracked 'liked_by_me' we would toggle it. 
                // Since simpler backend doesn't return that per user yet, we just increment to show interaction
                return { ...p, likes: p.likes + 1, liked_by_me: true }; // Assume liked by current user
            }
            return p;
        }));

        await toggleLike(postId);
        // In real app, re-fetch or sync state properly
    };

    const toggleComments = async (postId: string) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
        } else {
            setExpandedPostId(postId);
            if (!comments[postId]) {
                const fetchedComments = await getComments(postId);
                setComments(prev => ({ ...prev, [postId]: fetchedComments }));
            }
        }
    };

    const handleAddComment = async (postId: string) => {
        if (!commentInput.trim()) return;
        const newComment = await addComment(postId, commentInput);
        if (newComment) {
            const enrichedComment = {
                ...newComment,
                author: {
                    name: user?.user_metadata?.full_name || 'Me',
                    avatar_url: user?.user_metadata?.avatar_url || null
                }
            };
            setComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), enrichedComment]
            }));
            setPosts(posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
            setCommentInput('');
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-black">
                <TopBar>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Users className="w-5 h-5 text-indigo-500" />
                        </div>
                        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                            Community Hub
                        </span>
                    </div>
                </TopBar>

                <div className="flex-1 overflow-y-auto">
                    {/* Hero Banner */}
                    <div className="relative h-48 sm:h-64 w-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop"
                            alt="Community"
                            className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                                Connect, Share, Build.
                            </h1>
                            <p className="text-indigo-100 max-w-xl text-lg opacity-90">
                                Join 10,000+ developers sharing their hackathon journeys, code, and opportunities.
                            </p>
                        </div>
                    </div>

                    <div className="px-4 sm:px-6 lg:px-8 py-8 relative z-30">
                        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

                            {/* LEFT COLUMN: Main Feed */}
                            <div className="flex-1 min-w-0 space-y-6">

                                {/* Create Post Input */}
                                <div className="bg-white dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5 ring-1 ring-white/10">
                                    <div className="flex gap-4">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-indigo-500/20">
                                            {user?.email?.[0].toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={newPostContent}
                                                onChange={(e) => setNewPostContent(e.target.value)}
                                                placeholder="Share your latest project or ask a question..."
                                                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-500"
                                            />
                                            <div className="flex justify-between items-center mt-3">
                                                <div className="flex gap-2">
                                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                                                        <Code2 className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Code</span>
                                                    </button>
                                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-colors">
                                                        <Zap className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Media</span>
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={handleCreatePost}
                                                    disabled={isPosting || !newPostContent}
                                                    className="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs rounded-lg hover:opacity-90 transition-all shadow-lg shadow-black/10 disabled:opacity-50"
                                                >
                                                    {isPosting ? 'Posting...' : 'Post Update'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
                                    {CATEGORIES.map((category) => {
                                        const Icon = category.icon;
                                        return (
                                            <button
                                                key={category.name}
                                                onClick={() => setActiveTab(category.name)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${activeTab === category.name
                                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-md'
                                                    : 'bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                                    }`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                {category.name}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Posts Feed */}
                                {isLoading ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                    </div>
                                ) : posts.length === 0 ? (
                                    <div className="text-center py-10 text-zinc-500">
                                        No posts yet in this category. Be the first!
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {posts.map(post => (
                                            <div key={post.id} className="group bg-white dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300">
                                                {/* Post Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex gap-3">
                                                        <img src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.name}&background=random`} alt={post.author.name} className="w-11 h-11 rounded-full ring-2 ring-white dark:ring-zinc-800 object-cover" />
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-500 cursor-pointer">{post.author.name}</h3>
                                                                {post.author.badge && (
                                                                    <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                                                                        {post.author.badge}
                                                                    </span>
                                                                )}
                                                                <span className="text-zinc-400 text-xs">• {timeAgo(post.created_at)}</span>
                                                            </div>
                                                            <p className="text-xs text-zinc-500 font-medium">{post.author.role}</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Content */}
                                                <div className="pl-14">
                                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 whitespace-pre-wrap">
                                                        {post.content}
                                                    </p>

                                                    {post.image_url && (
                                                        <div className="mb-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                                            <img src={post.image_url} alt="Post attachment" className="w-full h-auto object-cover max-h-80 hover:scale-105 transition-transform duration-500" />
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-8 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                                        <button
                                                            onClick={() => handleLike(post.id)}
                                                            className="flex items-center gap-2 text-zinc-500 hover:text-rose-500 transition-colors group"
                                                        >
                                                            <Heart className={`w-4.5 h-4.5 group-hover:scale-110 transition-transform ${post.liked_by_me ? 'fill-rose-500 text-rose-500' : ''}`} />
                                                            <span className="text-xs font-semibold">{post.likes}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => toggleComments(post.id)}
                                                            className="flex items-center gap-2 text-zinc-500 hover:text-indigo-500 transition-colors group"
                                                        >
                                                            <MessageSquare className="w-4.5 h-4.5 group-hover:scale-110 transition-transform group-hover:fill-indigo-500" />
                                                            <span className="text-xs font-semibold">{post.comments}</span>
                                                        </button>
                                                        <button className="flex items-center gap-2 text-zinc-500 hover:text-emerald-500 transition-colors group ml-auto">
                                                            <Share2 className="w-4.5 h-4.5" />
                                                        </button>
                                                    </div>

                                                    {/* Comments Section */}
                                                    {expandedPostId === post.id && (
                                                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 animate-in fade-in slide-in-from-top-2">
                                                            <div className="space-y-4 mb-4">
                                                                {comments[post.id]?.map(comment => (
                                                                    <div key={comment.id} className="flex gap-3">
                                                                        <img src={comment.author.avatar_url || `https://ui-avatars.com/api/?name=${comment.author.name}&background=random`} className="w-6 h-6 rounded-full" />
                                                                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg rounded-tl-none flex-1">
                                                                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{comment.author.name}</p>
                                                                            <p className="text-xs text-zinc-700 dark:text-zinc-300">{comment.content}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {(!comments[post.id] || comments[post.id].length === 0) && (
                                                                    <p className="text-xs text-zinc-400 italic">No comments yet.</p>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={commentInput}
                                                                    onChange={(e) => setCommentInput(e.target.value)}
                                                                    placeholder="Write a comment..."
                                                                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-500"
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                                                />
                                                                <button
                                                                    onClick={() => handleAddComment(post.id)}
                                                                    className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                                                                >
                                                                    <Send className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN: Sidebar (Desktop) */}
                            <div className="hidden lg:block w-80 space-y-6">

                                {/* Search */}
                                <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/30 transition-shadow">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            placeholder="Search community..."
                                            className="w-full bg-transparent border-none rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500"
                                        />
                                    </div>
                                </div>

                                {/* Trending Topics */}
                                <div className="bg-white dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Trending Now</h3>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        {TRENDING_TOPICS.map((topic, i) => (
                                            <div key={topic.name} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl group cursor-pointer transition-colors">
                                                <div>
                                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 mb-0.5">{(i + 1).toString().padStart(2, '0')} • Trending</p>
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">
                                                        #{topic.name}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400 mt-1">{topic.count} posts</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                                                    {topic.trend}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/50">
                                        <button className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                            View all topics
                                        </button>
                                    </div>
                                </div>

                                {/* Trending Hackathons (REPLACED Top Builders) */}
                                <div className="bg-white dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/20">
                                        <div className="flex items-center gap-2">
                                            <LineChart className="w-4 h-4 text-emerald-500" />
                                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Most Tracked Hackathons</h3>
                                        </div>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {TRENDING_HACKATHONS.map((hackathon, i) => (
                                            <div key={hackathon.name} className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors cursor-pointer group">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-bold text-xs text-zinc-500">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-500 transition-colors">{hackathon.name}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-zinc-400">{hackathon.platform}</span>
                                                        <span className="text-[10px] text-zinc-300">•</span>
                                                        <span className="text-[10px] font-medium text-emerald-500">{hackathon.trackers} trackers</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/50">
                                        <button className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                            Explore Hackathons
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-center shadow-lg shadow-indigo-500/20">
                                    <h3 className="text-white font-bold text-lg mb-1">HackHub Premium</h3>
                                    <p className="text-indigo-100 text-xs mb-4 opacity-90">Unlock exclusive badges, analytics, and more.</p>
                                    <button className="w-full py-2 bg-white text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-50 transition-colors shadow-md">
                                        Upgrade Now
                                    </button>
                                </div>

                                {/* Footer links */}
                                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-zinc-400 px-4 text-center">
                                    <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-200">Guidelines</a>
                                    <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-200">Privacy Policy</a>
                                    <a href="#" className="hover:text-zinc-600 dark:hover:text-zinc-200">Support</a>
                                    <span>© 2026 HackHub</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
