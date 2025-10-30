import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Building, Briefcase, FileText, TrendingUp } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  approvedEmployers: number;
  pendingJobs: number;
  activeJobs: number;
}

export function Analytics() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
    approvedEmployers: 0,
    pendingJobs: 0,
    activeJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [
      usersResult,
      employersResult,
      jobsResult,
      applicationsResult,
      approvedEmployersResult,
      pendingJobsResult,
      activeJobsResult,
    ] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('employer_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('jobs').select('id', { count: 'exact', head: true }),
      supabase.from('applications').select('id', { count: 'exact', head: true }),
      supabase
        .from('employer_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_approved', true),
      supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('is_active', true),
    ]);

    setStats({
      totalUsers: usersResult.count || 0,
      totalEmployers: employersResult.count || 0,
      totalJobs: jobsResult.count || 0,
      totalApplications: applicationsResult.count || 0,
      approvedEmployers: approvedEmployersResult.count || 0,
      pendingJobs: pendingJobsResult.count || 0,
      activeJobs: activeJobsResult.count || 0,
    });

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Job Seekers',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Employers',
      value: stats.totalEmployers,
      icon: Building,
      color: 'bg-green-500',
    },
    {
      name: 'Total Jobs Posted',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'bg-orange-500',
    },
  ];

  const actionCards = [
    {
      name: 'Approved Employers',
      value: stats.approvedEmployers,
      total: stats.totalEmployers,
      icon: Building,
      color: 'text-green-600',
    },
    {
      name: 'Pending Jobs',
      value: stats.pendingJobs,
      icon: Briefcase,
      color: 'text-yellow-600',
    },
    {
      name: 'Active Jobs',
      value: stats.activeJobs,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Analytics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.name}</p>
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions Needed</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.name}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`h-5 w-5 ${card.color}`} />
                  <p className="text-sm font-medium text-gray-700">{card.name}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                  {card.total !== undefined && (
                    <span className="text-base text-gray-500"> / {card.total}</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
