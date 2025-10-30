import { useState, useEffect } from 'react';
import { supabase, EmployerProfile } from '../../lib/supabase';
import { Building, Search, CheckCircle, XCircle, ToggleLeft, ToggleRight } from 'lucide-react';

export function ManageEmployers() {
  const [employers, setEmployers] = useState<EmployerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmployers();
  }, [searchTerm]);

  async function loadEmployers() {
    let query = supabase
      .from('employer_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.or(`company_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const { data } = await query;
    setEmployers(data || []);
    setLoading(false);
  }

  async function toggleApproval(employerId: string, currentStatus: boolean) {
    await supabase
      .from('employer_profiles')
      .update({ is_approved: !currentStatus })
      .eq('id', employerId);

    await loadEmployers();
  }

  async function toggleActiveStatus(employerId: string, currentStatus: boolean) {
    await supabase
      .from('employer_profiles')
      .update({ is_active: !currentStatus })
      .eq('id', employerId);

    await loadEmployers();
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading employers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Manage Employers</h2>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company name or email..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {employers.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No employers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Industry</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Approved</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employers.map((employer) => (
                  <tr key={employer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{employer.company_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{employer.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {employer.industry || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(employer.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employer.is_approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {employer.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employer.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleApproval(employer.id, employer.is_approved)}
                          className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                            employer.is_approved
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {employer.is_approved ? (
                            <>
                              <XCircle className="h-4 w-4" />
                              Revoke
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleActiveStatus(employer.id, employer.is_active)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          {employer.is_active ? (
                            <>
                              <ToggleRight className="h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-4 w-4" />
                              Activate
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
