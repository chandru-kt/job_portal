import { useState, useEffect } from 'react';
import { supabase, Application } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Mail, ExternalLink } from 'lucide-react';

export function Applicants() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, [selectedJob]);

  async function loadJobs() {
    if (!user) return;

    const { data } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false });

    setJobs(data || []);
  }

  async function loadApplications() {
    if (!user) return;

    let query = supabase
      .from('applications')
      .select(`
        *,
        jobs!inner(
          id,
          title,
          employer_id
        ),
        user_profiles(
          full_name,
          email,
          phone,
          location,
          skills,
          experience_years,
          resume_url,
          bio
        )
      `)
      .eq('jobs.employer_id', user.id)
      .order('applied_at', { ascending: false });

    if (selectedJob !== 'all') {
      query = query.eq('job_id', selectedJob);
    }

    const { data } = await query;
    setApplications(data || []);
    setLoading(false);
  }

  async function updateApplicationStatus(applicationId: string, newStatus: string) {
    await supabase
      .from('applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', applicationId);

    await loadApplications();
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'offered':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Applicants</h2>
        </div>

        <div className="mb-6">
          <label htmlFor="jobFilter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Job
          </label>
          <select
            id="jobFilter"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No applications yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Applications will appear here when job seekers apply to your jobs
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const candidate = application.user_profiles;
              if (!candidate) return null;

              return (
                <div
                  key={application.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {candidate.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Applied for: <span className="font-medium">{application.jobs?.title}</span>
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {candidate.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {candidate.email}
                          </span>
                        )}
                        {candidate.location && <span>{candidate.location}</span>}
                        {candidate.experience_years !== undefined && (
                          <span>{candidate.experience_years} years experience</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {candidate.bio && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Bio:</h4>
                      <p className="text-sm text-gray-600">{candidate.bio}</p>
                    </div>
                  )}

                  {application.cover_letter && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Cover Letter:</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-4">
                    {candidate.resume_url && (
                      <a
                        href={candidate.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Resume
                      </a>
                    )}

                    <select
                      value={application.status}
                      onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview</option>
                      <option value="offered">Offered</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
