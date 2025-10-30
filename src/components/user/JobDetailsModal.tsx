import { useState } from 'react';
import { supabase, Job } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, MapPin, Briefcase, DollarSign, Calendar, Award } from 'lucide-react';

interface Props {
  job: Job;
  onClose: () => void;
  onApply: () => void;
}

export function JobDetailsModal({ job, onClose, onApply }: Props) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user, profile } = useAuth();

  async function handleApply() {
    if (!user) return;

    setLoading(true);
    setError('');

    const userProfile = profile && 'resume_url' in profile ? profile : null;

    const { error: applyError } = await supabase
      .from('applications')
      .insert({
        job_id: job.id,
        user_id: user.id,
        cover_letter: coverLetter,
        resume_url: userProfile?.resume_url,
      });

    if (applyError) {
      if (applyError.message.includes('duplicate')) {
        setError('You have already applied to this job');
      } else {
        setError('Failed to submit application');
      }
    } else {
      setSuccess(true);
      setTimeout(() => {
        onApply();
      }, 2000);
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            {job.employer_profiles?.logo_url && (
              <img
                src={job.employer_profiles.logo_url}
                alt=""
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {job.employer_profiles?.company_name}
              </h3>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {job.job_type}
                </span>
                {job.salary_min && job.salary_max && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Experience Required
            </h4>
            <p className="text-gray-600">{job.experience_required} years</p>
          </div>

          {job.skills_required && job.skills_required.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill, index) => (
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

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Job Description</h4>
            <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.requirements && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {!success && (
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Apply for this position</h4>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    id="coverLetter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell the employer why you're a great fit for this role..."
                  />
                </div>

                <button
                  onClick={handleApply}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="border-t pt-6">
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-center">
                <p className="font-medium">Application submitted successfully!</p>
                <p className="text-sm mt-1">The employer will review your application soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
