/*
  # Hire My Hub - Complete Database Schema

  ## Overview
  This migration creates the complete database schema for the Hire My Hub job portal platform,
  including tables for users, employers, admins, jobs, applications, and messaging.

  ## New Tables

  ### 1. `user_profiles`
  Job seeker profiles with personal and professional information
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `email` (text)
  - `phone` (text)
  - `location` (text)
  - `skills` (text array)
  - `experience_years` (integer)
  - `resume_url` (text)
  - `bio` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `employer_profiles`
  Company/recruiter profiles for posting jobs
  - `id` (uuid, primary key, references auth.users)
  - `company_name` (text)
  - `email` (text)
  - `phone` (text)
  - `location` (text)
  - `industry` (text)
  - `company_size` (text)
  - `website` (text)
  - `description` (text)
  - `logo_url` (text)
  - `is_approved` (boolean)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `admin_profiles`
  Admin user profiles with management permissions
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `email` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 4. `job_categories`
  Categories for organizing job listings
  - `id` (uuid, primary key)
  - `name` (text)
  - `description` (text)
  - `created_at` (timestamptz)

  ### 5. `jobs`
  Job postings created by employers
  - `id` (uuid, primary key)
  - `employer_id` (uuid, references employer_profiles)
  - `category_id` (uuid, references job_categories)
  - `title` (text)
  - `description` (text)
  - `requirements` (text)
  - `location` (text)
  - `job_type` (text: full-time, part-time, contract, remote)
  - `experience_required` (integer)
  - `salary_min` (integer)
  - `salary_max` (integer)
  - `salary_currency` (text)
  - `skills_required` (text array)
  - `status` (text: draft, pending, approved, rejected, closed, expired)
  - `expires_at` (timestamptz)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `applications`
  Job applications submitted by users
  - `id` (uuid, primary key)
  - `job_id` (uuid, references jobs)
  - `user_id` (uuid, references user_profiles)
  - `cover_letter` (text)
  - `resume_url` (text)
  - `status` (text: pending, shortlisted, rejected, interview, offered, accepted)
  - `applied_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `saved_jobs`
  Jobs saved by users for later viewing
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `job_id` (uuid, references jobs)
  - `saved_at` (timestamptz)

  ### 8. `messages`
  Communication between employers and job seekers
  - `id` (uuid, primary key)
  - `sender_id` (uuid, references auth.users)
  - `receiver_id` (uuid, references auth.users)
  - `application_id` (uuid, references applications)
  - `subject` (text)
  - `content` (text)
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with policies for:
  - Users can manage their own data
  - Employers can manage their company data and job postings
  - Admins have full access
  - Public can view approved, active jobs
  - Application privacy between user, employer, and admin

  ## Notes
  - All timestamps use `timestamptz` for proper timezone handling
  - Foreign keys ensure referential integrity
  - Indexes added for frequently queried columns
  - User roles determined by which profile table has their auth.users.id
*/

-- Create enum types for better data consistency
DO $$ BEGIN
  CREATE TYPE job_type AS ENUM ('full-time', 'part-time', 'contract', 'remote', 'hybrid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'closed', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'shortlisted', 'rejected', 'interview', 'offered', 'accepted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  location text,
  skills text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  resume_url text,
  bio text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employer Profiles Table
CREATE TABLE IF NOT EXISTS employer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  location text,
  industry text,
  company_size text,
  website text,
  description text,
  logo_url text,
  is_approved boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin Profiles Table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Job Categories Table
CREATE TABLE IF NOT EXISTS job_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES job_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  requirements text,
  location text NOT NULL,
  job_type text NOT NULL DEFAULT 'full-time',
  experience_required integer DEFAULT 0,
  salary_min integer,
  salary_max integer,
  salary_currency text DEFAULT 'USD',
  skills_required text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  cover_letter text,
  resume_url text,
  status text DEFAULT 'pending',
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, user_id)
);

-- Saved Jobs Table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  subject text NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Employers can view user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM employer_profiles WHERE employer_profiles.id = auth.uid()));

CREATE POLICY "Admins can view all user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

-- RLS Policies for employer_profiles
CREATE POLICY "Employers can view their own profile"
  ON employer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Employers can update their own profile"
  ON employer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Employers can insert their own profile"
  ON employer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view approved employers"
  ON employer_profiles FOR SELECT
  TO authenticated
  USING (is_approved = true AND is_active = true);

CREATE POLICY "Admins can view all employer profiles"
  ON employer_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

CREATE POLICY "Admins can update employer profiles"
  ON employer_profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

-- RLS Policies for admin_profiles
CREATE POLICY "Admins can view their own profile"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for job_categories
CREATE POLICY "Anyone can view job categories"
  ON job_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage job categories"
  ON job_categories FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

-- RLS Policies for jobs
CREATE POLICY "Anyone can view approved active jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'approved' AND is_active = true);

CREATE POLICY "Employers can view their own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can insert their own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = employer_id);

CREATE POLICY "Admins can view all jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

CREATE POLICY "Admins can update all jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

-- RLS Policies for applications
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can view applications for their jobs"
  ON applications FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = applications.job_id 
    AND jobs.employer_id = auth.uid()
  ));

CREATE POLICY "Employers can update applications for their jobs"
  ON applications FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = applications.job_id 
    AND jobs.employer_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = applications.job_id 
    AND jobs.employer_id = auth.uid()
  ));

CREATE POLICY "Admins can view all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid()));

-- RLS Policies for saved_jobs
CREATE POLICY "Users can view their saved jobs"
  ON saved_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their saved jobs"
  ON saved_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved jobs"
  ON saved_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Insert default job categories
INSERT INTO job_categories (name, description) VALUES
  ('Technology', 'Software development, IT, and tech-related jobs'),
  ('Marketing', 'Digital marketing, content creation, and advertising'),
  ('Sales', 'Sales representatives, account managers, and business development'),
  ('Healthcare', 'Medical, nursing, and healthcare administration'),
  ('Finance', 'Accounting, financial analysis, and banking'),
  ('Education', 'Teaching, training, and educational administration'),
  ('Engineering', 'Mechanical, electrical, civil, and other engineering fields'),
  ('Design', 'Graphic design, UX/UI, and creative roles'),
  ('Human Resources', 'HR management, recruitment, and people operations'),
  ('Customer Service', 'Support, customer success, and service roles')
ON CONFLICT (name) DO NOTHING;