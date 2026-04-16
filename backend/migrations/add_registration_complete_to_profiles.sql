-- Migration: Add registration_complete column to profiles
-- Purpose: Track whether a collaborator's registration has been completed (supervisor assigned).
-- Draft users have registration_complete = false and are excluded from team listings.

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS registration_complete BOOLEAN DEFAULT true;

-- Ensure all existing profiles are marked as complete (they predate the draft workflow)
UPDATE profiles SET registration_complete = true WHERE registration_complete IS NULL;

COMMENT ON COLUMN profiles.registration_complete IS 'False for draft users pending supervisor assignment. True for fully registered collaborators.';
