import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'user' | 'employer' | 'admin' | null;

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  skills?: string[];
  experience_years?: number;
  resume_url?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployerProfile {
  id: string;
  company_name: string;
  email: string;
  phone?: string;
  location?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  category_id?: string;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  job_type: string;
  experience_required: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  skills_required?: string[];
  status: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employer_profiles?: EmployerProfile;
  job_categories?: { name: string };
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter?: string;
  resume_url?: string;
  status: string;
  applied_at: string;
  updated_at: string;
  jobs?: Job;
  user_profiles?: UserProfile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  application_id?: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (adminProfile) return 'admin';

  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (employerProfile) return 'employer';

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (userProfile) return 'user';

  return null;
}
