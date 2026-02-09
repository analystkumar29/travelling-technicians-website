import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import JobCard, { JobCardData } from '@/components/technician/JobCard';
import { techFetch } from '@/utils/technicianAuth';
import { Loader2, Inbox } from 'lucide-react';

type TabKey = 'active' | 'past';

export default function MyJobs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async (tab: TabKey) => {
    setLoading(true);
    try {
      const res = await techFetch(`/api/technician/my-jobs?status=${tab}`);
      if (res.ok) {
        setJobs(await res.json());
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(activeTab);
  }, [activeTab, fetchJobs]);

  return (
    <TechnicianLayout title="My Jobs" headerTitle="My Jobs">
      {/* Tab selector */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'past'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          Past
        </button>
      </div>

      {/* Job list */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {activeTab === 'active' ? 'No active jobs' : 'No past jobs'}
          </p>
          {activeTab === 'active' && (
            <button
              onClick={() => router.push('/technician/available-jobs')}
              className="mt-3 text-sm text-accent-600 font-medium"
            >
              Browse available jobs
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              showStatus
              onClick={() => router.push(`/technician/jobs/${job.id}`)}
            />
          ))}
        </div>
      )}
    </TechnicianLayout>
  );
}
