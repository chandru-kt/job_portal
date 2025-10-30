import { useState, useEffect } from 'react';
import { supabase, Job } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Bookmark, MapPin, Briefcase, Trash2 } from 'lucide-react';
import { JobDetailsModal } from './JobDetailsModal';

export function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<(Job & { saved_at: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadSavedJobs();
  }, []);

  async function loadSavedJobs() {
    if (!user) return;

    const { data } = await supabase
      .from('saved_jobs')
      .select(`
        saved_at,
        jobs(
          *,
          employer_profiles(company_name, logo_url),
          job_categories(name)
        )
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (data) {
      const jobs = data.map((item: any) => ({
        ...item.jobs,
        saved_at: item.saved_at,
      }));
      setSavedJobs(jobs);
    }

    setLoading(false);
  }

  async function handleRemove(jobId: string) {
    if (!user) return;

    await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', jobId);

    setSavedJobs(savedJobs.filter((job) => job.id !== jobId));
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading saved jobs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Saved Jobs</h2>
        </div>

        {savedJobs.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No saved jobs yet</p>
            <p className="text-sm text-gray-500 mt-2">Save jobs to review them later</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    {job.employer_profiles?.logo_url && (
                      <img
                        src={job.employer_profiles.logo_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {job.employer_profiles?.company_name}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.job_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemove(job.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove from saved jobs"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => {
            setSelectedJob(null);
            loadSavedJobs();
          }}
        />
      )}
    </div>
  );
}
