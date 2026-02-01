import supabase from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface Post {
    id: string;
    user_id: string;
    content: string;
    image_url?: string;
    category: string;
    tags: string[];
    created_at: string;
    author: {
        name: string;
        handle: string;
        avatar: string | null;
        role: string;
        badge?: string;
    };
    likes: number;
    comments: number;
    liked_by_me?: boolean; // Client-side state
}

export interface Comment {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    author: {
        name: string;
        avatar_url: string | null;
    };
}

export async function getPosts(category?: string): Promise<Post[]> {
    try {
        const url = new URL(`${API_URL}/api/community/posts`);
        if (category && category !== 'All') {
            url.searchParams.append('category', category);
        }

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Failed to fetch posts');

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

export async function createPost(content: string, category: string, tags: string[] = []): Promise<Post | null> {
    try {
        if (!supabase) return null;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const response = await fetch(`${API_URL}/api/community/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ content, category, tags })
        });

        if (!response.ok) throw new Error('Failed to create post');
        return await response.json();
    } catch (error) {
        console.error('Error creating post:', error);
        return null;
    }
}

export async function toggleLike(postId: string): Promise<boolean> {
    try {
        if (!supabase) return false;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return false;

        const response = await fetch(`${API_URL}/api/community/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (!response.ok) throw new Error('Failed to like post');
        const data = await response.json();
        return data.liked;
    } catch (error) {
        console.error('Error liking post:', error);
        return false;
    }
}

export async function getComments(postId: string): Promise<Comment[]> {
    try {
        const response = await fetch(`${API_URL}/api/community/posts/${postId}/comments`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        return await response.json();
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
}

export async function addComment(postId: string, content: string): Promise<Comment | null> {
    try {
        if (!supabase) return null;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const response = await fetch(`${API_URL}/api/community/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) throw new Error('Failed to add comment');
        return await response.json();
    } catch (error) {
        console.error('Error adding comment:', error);
        return null;
    }
}
