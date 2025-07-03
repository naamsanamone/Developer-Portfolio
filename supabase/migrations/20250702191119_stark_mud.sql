/*
  # Add reason field to contacts table

  1. Changes
    - Add `reason` column to `contacts` table
    - Set default value for existing records
    - Add check constraint for valid reasons

  2. Security
    - No changes to existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'reason'
  ) THEN
    ALTER TABLE contacts ADD COLUMN reason text DEFAULT 'general';
    
    -- Add check constraint for valid reasons
    ALTER TABLE contacts ADD CONSTRAINT contacts_reason_check 
    CHECK (reason IN ('job-offer', 'collaboration', 'feedback', 'general', 'other'));
  END IF;
END $$;