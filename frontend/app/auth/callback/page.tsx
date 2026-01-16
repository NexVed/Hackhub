'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            if (!supabase) {
                setError('Supabase is not configured');
                return;
            }

            try {
                // Get the session from the URL hash
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    setError(sessionError.message);
                    return;
                }

                if (session) {
                    // Successfully authenticated, redirect to dashboard
                    router.replace('/dashboard');
                } else {
                    // No session found, redirect to home
                    router.replace('/');
                }
            } catch (err) {
                console.error('Callback error:', err);
                setError('Authentication failed. Please try again.');
            }
        };

        handleCallback();
    }, [router]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="text-center p-8">
                    <div className="text-red-500 text-xl mb-4">Authentication Error</div>
                    <p className="text-zinc-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
                <p className="text-zinc-400">Completing sign in...</p>
            </div>
        </div>
    );
}
