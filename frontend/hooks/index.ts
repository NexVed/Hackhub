// Hooks barrel export
export { useIsMobile } from './use-mobile';

// TanStack Query hooks
export {
    useMNCHackathons,
    useCalendarHackathons,
    useHackathon,
    useUserHackathons,
    useIsRegistered,
    useRegisterForHackathon,
    useUpdateUserHackathon,
    useRemoveUserHackathon,
    useInvalidateHackathons,
    hackathonKeys,
} from './useHackathons';

export {
    useMyTeams,
    usePublicTeams,
    useTeamDetails,
    useHasPendingRequest,
    useCreateTeam,
    useJoinByCode,
    useRequestToJoin,
    useHandleRequest,
    useRemoveMember,
    useUpdateTeam,
    useDeleteTeam,
    useUploadTeamLogo,
    useInvalidateTeams,
    teamKeys,
} from './useTeams';

export {
    useActivityHeatmap,
    useInvalidateActivities,
    activityKeys,
} from './useActivities';
