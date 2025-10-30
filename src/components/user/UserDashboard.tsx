import { useState } from 'react';
import { JobSearch } from './JobSearch';
import { UserProfile } from './UserProfile';
import { MyApplications } from './MyApplications';
import { SavedJobs } from './SavedJobs';
import { Messages } from '../shared/Messages';
import { useAuth } from '../../contexts/AuthContext';
import { Search, User, FileText, Bookmark, MessageSquare, LogOut } from 'lucide-react';

type TabType = 'search' | 'profile' | 'applications' | 'saved' | 'messages';

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const { signOut, profile } = useAuth();

  const tabs = [
    { id: 'search' as TabType, name: 'Search Jobs', icon: Search },
    { id: 'applications' as TabType, name: 'My Applications', icon: FileText },
    { id: 'saved' as TabType, name: 'Saved Jobs', icon: Bookmark },
    { id: 'messages' as TabType, name: 'Messages', icon: MessageSquare },
    { id: 'profile' as TabType, name: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Hire My Hub</span>
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
            {activeTab === 'search' && <JobSearch />}
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'applications' && <MyApplications />}
            {activeTab === 'saved' && <SavedJobs />}
            {activeTab === 'messages' && <Messages />}
          </main>
        </div>
      </div>
    </div>
  );
}
