import express from 'express';
import { createClient } from '@supabase/supabase-js';
import supabase from '../services/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to get authenticated client
const getScopedSupabase = (req) => {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY,
        {
            global: {
                headers: {
                    Authorization: req.headers.authorization
                }
            }
        }
    );
};

// GET /api/community/posts
router.get('/posts', async (req, res) => {
    try {
        const { category } = req.query;
        let query = supabase
            .from('posts')
            .select(`
                *,
                likes (count),
                comments (count)
            `)
            .order('created_at', { ascending: false });

        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        const { data: posts, error } = await query;

        if (error) throw error;

        // Fetch author profiles manually since we might not have a hard FK constraint
        const userIds = [...new Set(posts.map(p => p.user_id))];
        let profilesMap = {};

        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, username, avatar_url, headline, role') // Access role if it exists, or headline
                .in('id', userIds);

            if (profiles) {
                profilesMap = profiles.reduce((acc, profile) => {
                    acc[profile.id] = profile;
                    return acc;
                }, {});
            }
        }

        // Check if current user liked each post
        let userLikes = new Set();
        // If we have a user token, we could check. But usually GET posts is public. 
        // We'll handle "isLiked" on frontend or if we pass auth token.
        // For simplicity, let's just return the counts and data.

        const enrichedPosts = posts.map(post => {
            const profile = profilesMap[post.user_id];
            return {
                ...post,
                author: {
                    name: profile?.name || 'Unknown User',
                    handle: profile?.username ? `@${profile.username}` : 'user',
                    avatar: profile?.avatar_url || null,
                    role: profile?.headline || 'Member',
                    badge: profile?.role === 'admin' ? 'Admin' : null // Mock badge logic based on role
                },
                likes: post.likes[0]?.count || 0,
                comments: post.comments[0]?.count || 0,
            };
        });

        res.json(enrichedPosts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/community/posts
router.post('/posts', requireAuth, async (req, res) => {
    try {
        const scopedSupabase = getScopedSupabase(req);
        const { content, category, tags, image_url } = req.body;
        const userId = req.user.id;

        const { data, error } = await scopedSupabase
            .from('posts')
            .insert({
                user_id: userId,
                content,
                category: category || 'Discussions',
                tags: tags || [],
                image_url
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/community/posts/:id/like
router.post('/posts/:id/like', requireAuth, async (req, res) => {
    try {
        const scopedSupabase = getScopedSupabase(req);
        const { id } = req.params;
        const userId = req.user.id;

        // Check if already liked
        const { data: existing } = await scopedSupabase
            .from('likes')
            .select()
            .eq('post_id', id)
            .eq('user_id', userId)
            .single();

        if (existing) {
            // Unlike
            await scopedSupabase
                .from('likes')
                .delete()
                .eq('id', existing.id);
            res.json({ liked: false });
        } else {
            // Like
            await scopedSupabase
                .from('likes')
                .insert({
                    post_id: id,
                    user_id: userId
                });
            res.json({ liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/community/posts/:id/comments
router.get('/posts/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Fetch profiles
        const userIds = [...new Set(comments.map(c => c.user_id))];
        let profilesMap = {};
        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, username, avatar_url')
                .in('id', userIds);

            if (profiles) {
                profilesMap = profiles.reduce((acc, profile) => {
                    acc[profile.id] = profile;
                    return acc;
                }, {});
            }
        }

        const enrichedComments = comments.map(c => ({
            ...c,
            author: profilesMap[c.user_id] || { name: 'Unknown', avatar_url: null }
        }));

        res.json(enrichedComments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/community/posts/:id/comments
router.post('/posts/:id/comments', requireAuth, async (req, res) => {
    try {
        const scopedSupabase = getScopedSupabase(req);
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const { data, error } = await scopedSupabase
            .from('comments')
            .insert({
                post_id: id,
                user_id: userId,
                content
            })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
