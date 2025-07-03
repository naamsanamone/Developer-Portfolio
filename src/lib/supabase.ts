import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseKey ? 'Present' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL in .env file.');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
};

// Database type definitions
export interface Project {
  id: number;
  title: string;
  description: string;
  image_url: string;
  tech_stack: string[];
  live_url?: string;
  github_url?: string;
  category: 'Fullstack' | 'Frontend' | 'Backend' | 'AI' | 'Open Source';
  featured: boolean;
  created_at: string;
}

export interface Contact {
  id?: number;
  name: string;
  email: string;
  message: string;
  created_at?: string;
}

export interface Visit {
  id: number;
  count: number;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  icon_url: string;
  level: number;
  category: string;
  created_at: string;
}

export interface Experience {
  id: number;
  title: string;
  organization: string;
  type: 'work' | 'training' | 'certification';
  description: string;
  start_date: string;
  end_date?: string;
  location?: string;
  url?: string;
  logo_url?: string;
  skills: string[];
  status: 'completed' | 'ongoing' | 'current';
  created_at: string;
}