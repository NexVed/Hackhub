-- Fix RLS: Ensure users can insert their own activities
-- Drop potential conflicting or old policies to ensure a clean slate
DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;
DROP POLICY IF EXISTS "Users can insert activities" ON public.user_activities;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.user_activities;

-- Create the correct policy
CREATE POLICY "Users can insert own activities"
ON public.user_activities
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure update/delete are also covered if needed, though the error was INSERT
DROP POLICY IF EXISTS "Users can update own activities" ON public.user_activities;
CREATE POLICY "Users can update own activities"
ON public.user_activities
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own activities" ON public.user_activities;
CREATE POLICY "Users can delete own activities"
ON public.user_activities
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
