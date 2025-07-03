/*
  # Experience Database Schema

  1. New Tables
    - `experience` - Store work experience, trainings, and certifications
      - `id` (bigint, primary key)
      - `title` (text) - Job title, training name, or certification name
      - `organization` (text) - Company, training provider, or issuer
      - `type` (text) - 'work', 'training', or 'certification'
      - `description` (text) - Responsibilities, skills learned, or credential details
      - `start_date` (date) - Start date for work/training, issue date for certifications
      - `end_date` (date, nullable) - End date (null for current positions/ongoing)
      - `location` (text, nullable) - Work location or training format
      - `url` (text, nullable) - Credential URL or company website
      - `logo_url` (text, nullable) - Company/organization logo
      - `skills` (text[]) - Technologies or skills involved
      - `status` (text) - 'completed', 'ongoing', 'current' for different states
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on experience table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS experience (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  organization text NOT NULL,
  type text NOT NULL CHECK (type IN ('work', 'training', 'certification')),
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  location text,
  url text,
  logo_url text,
  skills text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'ongoing', 'current')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE experience ENABLE ROW LEVEL SECURITY;

-- Allow public read access to experience
CREATE POLICY "Experience is publicly readable"
  ON experience
  FOR SELECT
  TO public
  USING (true);

-- Insert sample experience data
INSERT INTO experience (title, organization, type, description, start_date, end_date, location, url, logo_url, skills, status) VALUES

-- Work Experience
(
  'Senior Full-Stack Developer',
  'Mphasis',
  'work',
  'Led development of enterprise web applications serving 100k+ users. Architected microservices using Spring Boot and React. Mentored junior developers and established coding standards. Improved application performance by 40% through optimization.',
  '2021-06-01',
  NULL,
  'Bangalore, India (Remote)',
  'https://www.mphasis.com',
  'https://images.crunchbase.com/image/upload/c_lpad,f_auto,q_auto:eco,dpr_1/erkxwhl1gd48xfh2nqud',
  ARRAY['React', 'Java', 'Spring Boot', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
  'current'
),
(
  'Full-Stack Developer',
  'Tech Solutions Inc',
  'work',
  'Developed and maintained multiple client projects using React and Node.js. Implemented CI/CD pipelines and automated testing. Collaborated with cross-functional teams to deliver high-quality software solutions.',
  '2019-03-01',
  '2021-05-31',
  'Mumbai, India',
  'https://techsolutions.example.com',
  'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=TS',
  ARRAY['React', 'Node.js', 'MongoDB', 'Express.js', 'Git', 'Jenkins'],
  'completed'
),
(
  'Junior Software Developer',
  'StartupXYZ',
  'work',
  'Built responsive web applications using modern JavaScript frameworks. Participated in agile development processes and code reviews. Gained experience in full-stack development and database design.',
  '2018-01-01',
  '2019-02-28',
  'Pune, India',
  'https://startupxyz.example.com',
  'https://via.placeholder.com/100x100/10B981/FFFFFF?text=SX',
  ARRAY['JavaScript', 'React', 'MySQL', 'PHP', 'HTML', 'CSS'],
  'completed'
),

-- Training/Courses
(
  'AWS Solutions Architect Professional',
  'Amazon Web Services',
  'training',
  'Comprehensive training on AWS cloud architecture, security, and best practices. Covered advanced topics including multi-region deployments, disaster recovery, and cost optimization strategies.',
  '2023-01-15',
  '2023-03-20',
  'Online',
  'https://aws.amazon.com/training/',
  'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  ARRAY['AWS', 'Cloud Architecture', 'Security', 'DevOps'],
  'completed'
),
(
  'React Advanced Patterns & Performance',
  'Frontend Masters',
  'training',
  'Deep dive into advanced React patterns, performance optimization, and modern development practices. Learned about hooks, context, suspense, and concurrent features.',
  '2022-09-01',
  '2022-11-15',
  'Online',
  'https://frontendmasters.com',
  'https://static.frontendmasters.com/assets/brand/logos/full.png',
  ARRAY['React', 'JavaScript', 'Performance', 'Hooks'],
  'completed'
),
(
  'Java Microservices with Spring Boot',
  'Udemy',
  'training',
  'Comprehensive course on building scalable microservices using Spring Boot, Spring Cloud, and Docker. Covered service discovery, API gateways, and distributed tracing.',
  '2022-03-01',
  '2022-05-30',
  'Online',
  'https://www.udemy.com',
  'https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg',
  ARRAY['Java', 'Spring Boot', 'Microservices', 'Docker'],
  'completed'
),
(
  'Machine Learning Specialization',
  'Coursera - Stanford University',
  'training',
  'Currently learning machine learning fundamentals, supervised and unsupervised learning algorithms, and neural networks. Hands-on projects with Python and TensorFlow.',
  '2024-01-01',
  NULL,
  'Online',
  'https://www.coursera.org',
  'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
  ARRAY['Python', 'Machine Learning', 'TensorFlow', 'Data Science'],
  'ongoing'
),

-- Certifications
(
  'AWS Certified Solutions Architect - Associate',
  'Amazon Web Services',
  'certification',
  'Validates expertise in designing distributed systems on AWS. Demonstrates knowledge of AWS services, security, and architectural best practices for scalable applications.',
  '2023-04-15',
  NULL,
  'Online Proctored',
  'https://www.credly.com/badges/example-aws-cert',
  'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  ARRAY['AWS', 'Cloud Architecture', 'Security'],
  'completed'
),
(
  'Oracle Certified Professional Java SE 11 Developer',
  'Oracle',
  'certification',
  'Demonstrates proficiency in Java SE 11 programming, including object-oriented programming, exception handling, and advanced Java features.',
  '2022-08-20',
  NULL,
  'Online Proctored',
  'https://www.credly.com/badges/example-java-cert',
  'https://upload.wikimedia.org/wikipedia/en/6/68/Oracle_SQL_Developer_logo.svg',
  ARRAY['Java', 'Object-Oriented Programming', 'Software Development'],
  'completed'
),
(
  'Google Cloud Professional Cloud Architect',
  'Google Cloud',
  'certification',
  'Validates ability to design, develop, and manage robust, secure, scalable, and dynamic solutions on Google Cloud Platform.',
  '2023-09-10',
  NULL,
  'Online Proctored',
  'https://www.credly.com/badges/example-gcp-cert',
  'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
  ARRAY['Google Cloud', 'Cloud Architecture', 'DevOps'],
  'completed'
),
(
  'Certified Kubernetes Administrator (CKA)',
  'Cloud Native Computing Foundation',
  'certification',
  'Demonstrates skills in Kubernetes cluster administration, including installation, configuration, and troubleshooting of Kubernetes clusters.',
  '2023-11-25',
  NULL,
  'Online Proctored',
  'https://www.credly.com/badges/example-k8s-cert',
  'https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg',
  ARRAY['Kubernetes', 'Container Orchestration', 'DevOps'],
  'completed'
)

ON CONFLICT DO NOTHING;