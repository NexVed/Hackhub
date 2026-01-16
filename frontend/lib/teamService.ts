import supabase from './supabase';
import { logActivity } from './activityService';

export interface Team {
    id: string;
    name: string;
    description?: string;
    hackathon_id?: string;
    status: 'recruiting' | 'active' | 'completed';
    owner_id: string;
    team_code?: string;
    is_public: boolean;
    created_at?: string;
    updated_at?: string;
    logo_url?: string;
}

/**
 * Upload team logo
 */
export async function uploadTeamLogo(teamId: string, file: File): Promise<{ success: boolean; url?: string; error?: any }> {
    if (!supabase) return { success: false, error: 'Not authenticated' };

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${teamId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('team-logos')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('team-logos')
            .getPublicUrl(filePath);

        // Update team with new logo URL
        const { error: updateError } = await supabase
            .from('teams')
            .update({ logo_url: publicUrl })
            .eq('id', teamId);

        if (updateError) throw updateError;

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('Error uploading logo:', error);
        return { success: false, error };
    }
}

export interface TeamMember {
    id: string;
    team_id: string;
    user_id: string;
    role?: string;
    skills?: string[];
    joined_at?: string;
    // Joined from profiles
    profile?: {
        name?: string;
        username?: string;
        avatar_url?: string;
    };
}

export interface TeamRequest {
    id: string;
    team_id: string;
    user_id: string;
    status: 'pending' | 'accepted' | 'declined';
    created_at?: string;
    // Joined from profiles
    profile?: {
        name?: string;
        username?: string;
        avatar_url?: string;
    };
}

export interface TeamWithMembers extends Team {
    members: TeamMember[];
    member_count: number;
    pending_requests?: number;
}

export interface CreateTeamData {
    name: string;
    description?: string;
    hackathon_id?: string;
    status?: 'recruiting' | 'active' | 'completed';
    is_public?: boolean;
}

export interface TeamDetails extends Team {
    members: TeamMember[];
    requests: TeamRequest[];
}

/**
 * Get team details with members and requests (for manage page)
 */
export async function getTeamDetails(teamId: string): Promise<TeamDetails | null> {
    if (!supabase) return null;

    try {
        // Get team
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', teamId)
            .single();

        if (teamError || !team) return null;

        // Get members
        const { data: members } = await supabase
            .from('team_members')
            .select(`*, profile:profiles(id, name, username, avatar_url, skills)`)
            .eq('team_id', teamId);

        // Get pending requests
        const { data: requests } = await supabase
            .from('team_requests')
            .select(`*, profile:profiles(id, name, username, avatar_url, skills)`)
            .eq('team_id', teamId)
            .eq('status', 'pending');

        return {
            ...team,
            members: members || [],
            requests: requests || [],
        } as TeamDetails;
    } catch (error) {
        console.error('Error fetching team details:', error);
        return null;
    }
}

/**
 * Create a new team
 */

export async function createTeam(userId: string, data: CreateTeamData): Promise<{ success: boolean; team?: Team; error?: any }> {
    if (!supabase || !userId) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Create the team
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert({
                name: data.name,
                description: data.description,
                hackathon_id: data.hackathon_id,
                status: data.status || 'recruiting',
                owner_id: userId,
                is_public: data.is_public ?? false,
            })
            .select()
            .single();

        if (teamError) {
            console.error('Error creating team:', teamError);
            return { success: false, error: teamError };
        }

        // Add owner as first member
        await supabase.from('team_members').insert({
            team_id: team.id,
            user_id: userId,
            role: 'Owner',
        });

        // Log activity
        await logActivity(userId, 'team_create', `Created team: ${team.name}`, undefined);

        return { success: true, team: team as Team };
    } catch (error) {
        console.error('Error creating team:', error);
        return { success: false, error };
    }
}

/**
 * Get teams the user owns or is a member of
 */
export async function getMyTeams(userId: string): Promise<TeamWithMembers[]> {
    if (!supabase || !userId) return [];

    try {
        // Get teams where user is owner or member
        const { data: memberTeams } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', userId);

        const teamIds = memberTeams?.map(m => m.team_id) || [];

        const { data: ownedTeams } = await supabase
            .from('teams')
            .select('id')
            .eq('owner_id', userId);

        const ownedIds = ownedTeams?.map(t => t.id) || [];
        const allTeamIds = [...new Set([...teamIds, ...ownedIds])];

        if (allTeamIds.length === 0) return [];

        // Fetch full team data
        const { data: teams, error } = await supabase
            .from('teams')
            .select('*')
            .in('id', allTeamIds)
            .order('created_at', { ascending: false });

        if (error || !teams) return [];

        // Fetch members for each team
        const teamsWithMembers = await Promise.all(
            teams.map(async (team) => {
                const { data: members } = await supabase!
                    .from('team_members')
                    .select(`
                        *,
                        profile:profiles(name, username, avatar_url)
                    `)
                    .eq('team_id', team.id);

                // Get pending requests count if owner
                let pendingRequests = 0;
                if (team.owner_id === userId) {
                    const { count } = await supabase!
                        .from('team_requests')
                        .select('*', { count: 'exact', head: true })
                        .eq('team_id', team.id)
                        .eq('status', 'pending');
                    pendingRequests = count || 0;
                }

                return {
                    ...team,
                    members: members || [],
                    member_count: members?.length || 0,
                    pending_requests: pendingRequests,
                } as TeamWithMembers;
            })
        );

        return teamsWithMembers;
    } catch (error) {
        console.error('Error fetching teams:', error);
        return [];
    }
}

/**
 * Get public teams for browsing
 */
export async function getPublicTeams(userId?: string): Promise<TeamWithMembers[]> {
    if (!supabase) return [];

    try {
        const { data: teams, error } = await supabase
            .from('teams')
            .select('*')
            .eq('is_public', true)
            .eq('status', 'recruiting')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error || !teams) return [];

        // Filter out teams user is already in
        let filteredTeams = teams;
        if (userId) {
            const { data: memberTeams } = await supabase
                .from('team_members')
                .select('team_id')
                .eq('user_id', userId);

            const memberTeamIds = new Set(memberTeams?.map(m => m.team_id) || []);
            filteredTeams = teams.filter(t => !memberTeamIds.has(t.id) && t.owner_id !== userId);
        }

        // Fetch member counts
        const teamsWithMembers = await Promise.all(
            filteredTeams.map(async (team) => {
                const { data: members } = await supabase!
                    .from('team_members')
                    .select(`*, profile:profiles(name, username, avatar_url)`)
                    .eq('team_id', team.id);

                return {
                    ...team,
                    members: members || [],
                    member_count: members?.length || 0,
                } as TeamWithMembers;
            })
        );

        return teamsWithMembers;
    } catch (error) {
        console.error('Error fetching public teams:', error);
        return [];
    }
}

/**
 * Join a team using team code
 */
export async function joinByCode(userId: string, code: string): Promise<{ success: boolean; team?: Team; error?: string }> {
    if (!supabase || !userId) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Find team by code
        const { data: team, error: findError } = await supabase
            .from('teams')
            .select('*')
            .eq('team_code', code.toUpperCase())
            .single();

        if (findError || !team) {
            return { success: false, error: 'Team not found. Check the code and try again.' };
        }

        // Check if already a member
        const { data: existing } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', team.id)
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) {
            return { success: false, error: 'You are already a member of this team.' };
        }

        // Add as member
        const { error: joinError } = await supabase.from('team_members').insert({
            team_id: team.id,
            user_id: userId,
            role: 'Member',
        });

        if (joinError) {
            return { success: false, error: 'Failed to join team.' };
        }

        // Log activity
        await logActivity(userId, 'team_join', `Joined team: ${team.name}`, undefined);

        return { success: true, team: team as Team };
    } catch (error) {
        console.error('Error joining team:', error);
        return { success: false, error: 'An error occurred.' };
    }
}

/**
 * Request to join a public team
 */
export async function requestToJoin(userId: string, teamId: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase || !userId) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Check if already requested
        const { data: existing } = await supabase
            .from('team_requests')
            .select('id, status')
            .eq('team_id', teamId)
            .eq('user_id', userId)
            .maybeSingle();

        if (existing) {
            if (existing.status === 'pending') {
                return { success: false, error: 'You have already requested to join.' };
            }
            if (existing.status === 'declined') {
                return { success: false, error: 'Your request was declined.' };
            }
        }

        // Create request
        const { error } = await supabase.from('team_requests').insert({
            team_id: teamId,
            user_id: userId,
            status: 'pending',
        });

        if (error) {
            return { success: false, error: 'Failed to send request.' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error requesting to join:', error);
        return { success: false, error: 'An error occurred.' };
    }
}

/**
 * Get pending requests for a team
 */
export async function getTeamRequests(teamId: string): Promise<TeamRequest[]> {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('team_requests')
            .select(`*, profile:profiles(name, username, avatar_url)`)
            .eq('team_id', teamId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) return [];
        return (data || []) as TeamRequest[];
    } catch (error) {
        return [];
    }
}

/**
 * Handle a join request (accept or decline)
 */
export async function handleRequest(requestId: string, action: 'accept' | 'decline'): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Get the request
        const { data: request } = await supabase
            .from('team_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (!request) {
            return { success: false, error: 'Request not found.' };
        }

        if (action === 'accept') {
            // Add as member
            await supabase.from('team_members').insert({
                team_id: request.team_id,
                user_id: request.user_id,
                role: 'Member',
            });

            // Update request status
            await supabase.from('team_requests').update({ status: 'accepted' }).eq('id', requestId);

            // Log activity for the new member
            // Warning: The current user (owner) is executing this, but the activity belongs to the new member.
            // RLS might prevent inserting for another user depending on policy.
            // Policy: "Users can insert own activities" -> FOR INSERT WITH CHECK (auth.uid() = user_id);
            // This means we CANNOT insert for another user.
            // So we skip logging here, OR we need a server-side function / admin client.
            // For now, let's skip to avoid RLS error, or assume the policy allows it if we change it.
            // Given I cannot change policy easily without migration file change and I want to be safe:
            // I will NOT log here for the *other* user.
            // Instead, I could log "Accepted member" for the owner?
            // "use different colors on the bases of the user activity".
            // Let's log for the OWNER that they managed the team? No, user asked for "user activity".
            // Since I can't log for the other user without RLS changes, I will omit this one for now.
        } else {
            // Decline
            await supabase.from('team_requests').update({ status: 'declined' }).eq('id', requestId);
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: 'An error occurred.' };
    }
}

/**
 * Remove a member from team
 */
export async function removeMember(teamId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('team_id', teamId)
            .eq('user_id', userId);

        if (error) {
            return { success: false, error: 'Failed to remove member.' };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: 'An error occurred.' };
    }
}

/**
 * Update team details
 */
export async function updateTeam(teamId: string, updates: Partial<Pick<Team, 'name' | 'description' | 'status' | 'is_public'>>): Promise<{ success: boolean; error?: any }> {
    if (!supabase) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { error } = await supabase
            .from('teams')
            .update(updates)
            .eq('id', teamId);

        if (error) {
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

/**
 * Delete a team
 */
export async function deleteTeam(teamId: string): Promise<{ success: boolean; error?: any }> {
    if (!supabase) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Delete members first
        await supabase.from('team_members').delete().eq('team_id', teamId);
        await supabase.from('team_requests').delete().eq('team_id', teamId);

        const { error } = await supabase.from('teams').delete().eq('id', teamId);

        if (error) {
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

/**
 * Check if user has pending request for a team
 */
export async function hasPendingRequest(userId: string, teamId: string): Promise<boolean> {
    if (!supabase || !userId) return false;

    try {
        const { data } = await supabase
            .from('team_requests')
            .select('id')
            .eq('team_id', teamId)
            .eq('user_id', userId)
            .eq('status', 'pending')
            .maybeSingle();

        return !!data;
    } catch (error) {
        return false;
    }
}
