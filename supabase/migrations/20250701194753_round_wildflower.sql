/*
  # Create Skills Table

  1. New Tables
    - `skills`
      - `id` (bigint, primary key)
      - `name` (text, skill name)
      - `icon_url` (text, URL to skill icon)
      - `level` (integer, 0-100 proficiency level)
      - `category` (text, skill category)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `skills` table
    - Add policy for public read access

  3. Sample Data
    - Insert sample skills with various categories and levels
*/

CREATE TABLE IF NOT EXISTS skills (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  icon_url text NOT NULL,
  level integer NOT NULL CHECK (level >= 0 AND level <= 100),
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Allow public read access to skills
CREATE POLICY "Skills are publicly readable"
  ON skills
  FOR SELECT
  TO public
  USING (true);

-- Insert sample skills data
INSERT INTO skills (name, icon_url, level, category) VALUES
-- Frontend Skills
('React', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', 95, 'Frontend'),
('TypeScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', 90, 'Frontend'),
('Next.js', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', 85, 'Frontend'),
('Tailwind CSS', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg', 92, 'Frontend'),
('JavaScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', 93, 'Frontend'),

-- Backend Skills
('Java', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', 88, 'Backend'),
('Spring Boot', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg', 85, 'Backend'),
('Node.js', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', 87, 'Backend'),
('Python', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', 82, 'Backend'),
('Express.js', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', 80, 'Backend'),

-- Database Skills
('PostgreSQL', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', 90, 'Database'),
('MongoDB', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', 85, 'Database'),
('Redis', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg', 78, 'Database'),
('MySQL', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', 83, 'Database'),

-- Cloud & DevOps Skills
('AWS', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg', 87, 'Cloud'),
('Docker', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', 85, 'DevOps'),
('Kubernetes', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg', 75, 'DevOps'),
('Git', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', 92, 'Tools'),

-- Mobile Skills
('React Native', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', 80, 'Mobile'),
('Flutter', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg', 75, 'Mobile'),

-- AI/ML Skills
('TensorFlow', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg', 70, 'AI/ML'),
('PyTorch', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg', 68, 'AI/ML')

ON CONFLICT DO NOTHING;