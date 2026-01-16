import supabase from './supabase';

export interface UserProfile {
    id: string;
    username: string;
    name: string;
    bio?: string;
    avatar_url?: string;
    headline?: string;
    institute?: string;
    course?: string;
    year?: string;
    gender?: string;
    mobile?: string;
    skills?: string[];
    resume_url?: string;
    social_github?: string;
    social_linkedin?: string;
    social_twitter?: string;
    social_instagram?: string;
    social_threads?: string;
    is_profile_completed: boolean;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!supabase || !userId) return null;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data as UserProfile;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: any }> {
    if (!supabase || !userId) return { success: false, error: 'Supabase not initialized' };

    try {
        // Use UPSERT to handle both INSERT (new profile) and UPDATE (existing profile)
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                ...updates,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            })
            .select();

        if (error) {
            console.error('Supabase profile update error:', error);
            throw error;
        }

        console.log('Profile updated successfully:', data);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating profile:', error);
        return { success: false, error };
    }
}

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
    if (!supabase || !userId) return null;

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            console.error('Avatar upload error:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        console.log('Avatar uploaded:', data.publicUrl);
        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return null;
    }
}
