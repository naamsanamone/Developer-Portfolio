/*
  # Portfolio Database Schema

  1. New Tables
    - `projects` - Store portfolio projects with details, tech stack, and links
    - `contacts` - Store contact form submissions from visitors
    - `visits` - Track website visit count for analytics

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access on projects and visits
    - Add policy for public insert on contacts
    - Visits table allows public update for incrementing counter
*/

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  tech_stack text[] NOT NULL DEFAULT '{}',
  live_url text,
  github_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to projects
CREATE POLICY "Projects are publicly readable"
  ON projects
  FOR SELECT
  TO public
  USING (true);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow public insert for contact form submissions
CREATE POLICY "Anyone can submit contact form"
  ON contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Visits table for tracking page visits
CREATE TABLE IF NOT EXISTS visits (
  id bigint PRIMARY KEY DEFAULT 1,
  count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Allow public read and update access to visits
CREATE POLICY "Visits are publicly readable"
  ON visits
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Visits can be updated by anyone"
  ON visits
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert initial visit counter
INSERT INTO visits (id, count) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects (you can modify these later)
INSERT INTO projects (title, description, image_url, tech_stack, live_url, github_url) VALUES
(
  'E-Commerce Platform',
  'A full-featured e-commerce platform with user authentication, payment processing, and admin dashboard. Built with modern technologies for optimal performance.',
  'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
  'https://demo-ecommerce.example.com',
  'https://github.com/sanamsai/ecommerce-platform'
),
(
  'Task Management App',
  'A collaborative task management application with real-time updates, team collaboration features, and advanced filtering capabilities.',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
  'https://taskflow-demo.example.com',
  'https://github.com/sanamsai/task-management'
),
(
  'Weather Dashboard',
  'A beautiful weather dashboard with location-based forecasts, interactive maps, and customizable widgets for weather tracking.',
  'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['React', 'Chart.js', 'OpenWeather API', 'PWA'],
  'https://weather-dash.example.com',
  'https://github.com/sanamsai/weather-dashboard'
),
(
  'AI Chat Application',
  'An intelligent chat application powered by OpenAI with conversation history, multiple AI models, and a clean user interface.',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['React', 'OpenAI API', 'Node.js', 'Socket.io', 'MongoDB'],
  'https://ai-chat.example.com',
  'https://github.com/sanamsai/ai-chat'
),
(
  'Portfolio Website',
  'This very portfolio website featuring dynamic content management, contact forms, and visitor analytics with modern design.',
  'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['React', 'TypeScript', 'Supabase', 'Framer Motion', 'Tailwind'],
  'https://sanamsai.dev',
  'https://github.com/sanamsai/portfolio'
),
(
  'Social Media Analytics',
  'A comprehensive analytics dashboard for social media management with data visualization and performance tracking.',
  'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['React', 'D3.js', 'Python', 'FastAPI', 'PostgreSQL'],
  'https://social-analytics.example.com',
  'https://github.com/sanamsai/social-analytics'
)
ON CONFLICT DO NOTHING;