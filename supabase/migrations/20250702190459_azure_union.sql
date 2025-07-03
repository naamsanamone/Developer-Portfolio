/*
  # Add category column to projects table

  1. Schema Changes
    - Add `category` column to projects table with default value
    - Add `featured` column to highlight top projects
    - Update existing projects with appropriate categories

  2. Data Updates
    - Categorize existing sample projects
    - Mark some projects as featured
*/

-- Add category and featured columns to projects table
DO $$
BEGIN
  -- Add category column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'category'
  ) THEN
    ALTER TABLE projects ADD COLUMN category text NOT NULL DEFAULT 'Fullstack';
  END IF;

  -- Add featured column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'featured'
  ) THEN
    ALTER TABLE projects ADD COLUMN featured boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add check constraint for category values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projects_category_check'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_category_check 
    CHECK (category IN ('Fullstack', 'Frontend', 'Backend', 'AI', 'Open Source'));
  END IF;
END $$;

-- Update existing projects with categories and featured status
UPDATE projects SET 
  category = 'Fullstack',
  featured = true
WHERE title = 'E-Commerce Platform';

UPDATE projects SET 
  category = 'Frontend',
  featured = true
WHERE title = 'Task Management App';

UPDATE projects SET 
  category = 'Frontend',
  featured = false
WHERE title = 'Weather Dashboard';

UPDATE projects SET 
  category = 'AI',
  featured = true
WHERE title = 'AI Chat Application';

UPDATE projects SET 
  category = 'Fullstack',
  featured = false
WHERE title = 'Portfolio Website';

UPDATE projects SET 
  category = 'Backend',
  featured = false
WHERE title = 'Social Media Analytics';