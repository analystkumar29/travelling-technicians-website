import { useState, useEffect } from 'react';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import JobCard, { JobCardData } from '@/components/technician/JobCard';
import { techFetch } from '@/utils/technicianAuth';
import { useRouter } from 'next/router';
import { Briefcase, Clock, Star, CalendarCheck, ChevronRight, Loader2 } from 'lucide-react';

interface TechProfile {
  full_name: string;
  current_status: string;
  rating: number;
  stats: {
    today_jobs: number;
    active_jobs: number;
    total_completed: number;
  };
}

export default function TechnicianDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<TechProfile | null>(null);
  const [todayJobs, setTodayJobs] = useState<JobCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, jobsRes] = await Promise.all([
          techFetch('/api/technician/me'),
          techFetch('/api/technician/my-jobs?status=active'),
        ]);

        if (profileRes.ok) {
          setProfile(await profileRes.json());
        }
        if (jobsRes.ok) {
          const jobs = await jobsRes.json();
          // Filter to today's jobs + sort by time
          const today = new Date().toISOString().split('T')[0];
          const todaysJobs = jobs.filter((j: any) => j.booking_date === today);
          setTodayJobs(todaysJobs.length > 0 ? todaysJobs : jobs.slice(0, 3));
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <TechnicianLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck className="h-4 w-4 text-accent-500" />
            <span className="text-xs text-gray-500">Today</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{profile?.stats.today_jobs || 0}</p>
          <p className="text-[10px] text-gray-400">jobs scheduled</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{profile?.stats.active_jobs || 0}</p>
          <p className="text-[10px] text-gray-400">in progress</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-500">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{profile?.stats.total_completed || 0}</p>
          <p className="text-[10px] text-gray-400">all time</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-gray-500">Rating</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{profile?.rating?.toFixed(1) || '5.0'}</p>
          <p className="text-[10px] text-gray-400">average</p>
        </div>
      </div>

      {/* Upcoming Jobs */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Upcoming Jobs</h2>
          <button
            onClick={() => router.push('/technician/my-jobs')}
            className="text-xs text-accent-600 font-medium flex items-center gap-0.5"
          >
            View all <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {todayJobs.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <CalendarCheck className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No upcoming jobs</p>
            <button
              onClick={() => router.push('/technician/available-jobs')}
              className="mt-3 text-sm text-accent-600 font-medium"
            >
              Browse available jobs
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                showStatus
                onClick={() => router.push(`/technician/jobs/${job.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/technician/available-jobs')}
            className="bg-accent-500 text-primary-900 font-semibold py-3 rounded-xl text-sm hover:bg-accent-400 active:bg-accent-600 transition-colors"
          >
            Find Jobs
          </button>
          <button
            onClick={() => router.push('/technician/my-jobs')}
            className="bg-primary-800 text-white font-semibold py-3 rounded-xl text-sm hover:bg-primary-700 active:bg-primary-900 transition-colors"
          >
            My Jobs
          </button>
        </div>
      </div>
    </TechnicianLayout>
  );
}
