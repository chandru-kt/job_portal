import { useState } from 'react';
import { ManageUsers } from './ManageUsers';
import { ManageEmployers } from './ManageEmployers';
import { ManageJobs } from './ManageJobs';
import { Analytics } from './Analytics';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Users, Building, Briefcase, BarChart3, LogOut } from 'lucide-react';

type TabType = 'analytics' | 'users' | 'employers' | 'jobs';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const { signOut, profile } = useAuth();

  const tabs = [
    { id: 'analytics' as TabType, name: 'Analytics', icon: BarChart3 },
    { id: 'users' as TabType, name: 'Manage Users', icon: Users },
    { id: 'employers' as TabType, name: 'Manage Employers', icon: Building },
    { id: 'jobs' as TabType, name: 'Manage Jobs', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Hire My Hub - Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {profile && 'full_name' in profile && profile.full_name}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'users' && <ManageUsers />}
            {activeTab === 'employers' && <ManageEmployers />}
            {activeTab === 'jobs' && <ManageJobs />}
          </main>
        </div>
      </div>
    </div>
  );
}
