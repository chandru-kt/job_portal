# Hire My Hub - Job Portal Platform

A comprehensive job portal platform built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Job Seekers (Users)
- Create and manage profile with skills, experience, and resume
- Search and filter jobs by keyword, location, and category
- Apply to jobs with cover letters
- Save jobs for later viewing
- Track application status
- View and manage messages
- Update personal information

### Employers
- Create company profile with business information
- Post and manage job listings
- View and filter applicants by job
- Update application status (shortlist, interview, reject, etc.)
- Review candidate profiles, skills, and cover letters
- Access resume links
- Send messages to candidates

### Administrators
- View platform analytics and statistics
- Manage user accounts (activate/deactivate)
- Approve or reject employer registrations
- Review and approve job postings
- Monitor platform activity
- Manage all content

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Build Tool**: Vite

## Database Schema

The platform uses the following main tables:
- `user_profiles` - Job seeker profiles
- `employer_profiles` - Company profiles
- `admin_profiles` - Administrator accounts
- `jobs` - Job postings
- `job_categories` - Job categorization
- `applications` - Job applications
- `saved_jobs` - User saved jobs
- `messages` - Communication system

All tables are protected with Row Level Security (RLS) policies.

## Security

- Email/password authentication
- Role-based access control (User, Employer, Admin)
- Row Level Security on all database tables
- Secure data access patterns
- Protected routes based on user roles

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## User Roles

### Creating Different User Types

**Job Seeker**: Sign up and select "Job Seeker" during registration

**Employer**: Sign up and select "Employer" during registration (requires admin approval)

**Admin**: Must be created directly in the database by inserting into `admin_profiles` table

## Key Workflows

### For Job Seekers
1. Sign up and complete profile
2. Search for jobs using filters
3. Save interesting jobs
4. Apply to jobs with cover letter
5. Track application status

### For Employers
1. Sign up with company information
2. Wait for admin approval
3. Post job listings
4. Review applicants
5. Update application statuses
6. Communicate with candidates

### For Admins
1. Log in to admin dashboard
2. Approve employer registrations
3. Review and approve job postings
4. Monitor platform metrics
5. Manage users and content
