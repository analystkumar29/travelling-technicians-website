import { useState, useEffect, useCallback } from 'react';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import JobCard, { JobCardData } from '@/components/technician/JobCard';
import { techFetch } from '@/utils/technicianAuth';
import { supabase } from '@/utils/supabaseClient';
import { Loader2, RefreshCw, Inbox, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const DISMISSED_KEY = 'tt-dismissed-jobs';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface DismissedEntry {
  id: string;
  dismissedAt: number;
}

function loadDismissed(): DismissedEntry[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return [];
    const entries: DismissedEntry[] = JSON.parse(raw);
    const now = Date.now();
    // Auto-clean entries older than 7 days
    return entries.filter(e => now - e.dismissedAt < DISMISS_TTL_MS);
  } catch {
    return [];
  }
}

function saveDismissed(entries: DismissedEntry[]) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(entries));
}

export default function AvailableJobs() {
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState<DismissedEntry[]>([]);

  // Load dismissed set from localStorage on mount
  useEffect(() => {
    const entries = loadDismissed();
    setDismissed(entries);
    // Persist cleaned entries (removes expired ones)
    saveDismissed(entries);
  }, []);

  const dismissJob = useCallback((jobId: string, bookingRef?: string) => {
    const entry: DismissedEntry = { id: jobId, dismissedAt: Date.now() };
    setDismissed(prev => {
      const next = [...prev, entry];
      saveDismissed(next);
      return next;
    });

    toast('Job hidden from feed', {
      action: {
        label: 'Undo',
        onClick: () => {
          setDismissed(prev => {
            const next = prev.filter(e => e.id !== jobId);
            saveDismissed(next);
            return next;
          });
        },
      },
      duration: 5000,
    });
  }, []);

  const clearDismissed = useCallback(() => {
    setDismissed([]);
    localStorage.removeItem(DISMISSED_KEY);
  }, []);

  const fetchJobs = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await techFetch('/api/technician/smart-feed');
      if (res.ok) {
        setJobs(await res.json());
      }
    } catch (error) {
      console.error('Error fetching smart feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Realtime: listen for new confirmed bookings and status changes
  useEffect(() => {
    const channel = supabase
      .channel('tech-job-feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
      }, (payload) => {
        const booking = payload.new as Record<string, unknown>;
        const ref = (booking.booking_ref as string) || 'New job';
        toast.info('New job just posted!', { description: ref, duration: 5000 });
        fetchJobs(false);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
      }, (payload) => {
        // If a booking was claimed by someone else, remove from feed
        if (payload.new && (payload.new as any).status === 'assigned') {
          const ref = (payload.new as any).booking_ref || 'A job';
          toast(`${ref} was claimed`, { duration: 4000 });
          setJobs(prev => prev.filter(j => (j.booking_id || j.id) !== (payload.new as any).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs]);

  const claimJob = async (bookingId: string) => {
    setClaimingId(bookingId);
    try {
      const res = await techFetch('/api/technician/claim', {
        method: 'POST',
        body: JSON.stringify({ booking_id: bookingId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Job claimed! Check My Jobs.');
        // Remove from feed
        setJobs(prev => prev.filter(j => (j.booking_id || j.id) !== bookingId));
      } else {
        toast.error(data.error || 'Failed to claim job');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setClaimingId(null);
    }
  };

  // Build dismissed ID set for fast lookup
  const dismissedIds = new Set(dismissed.map(e => e.id));
  const visibleJobs = jobs.filter(j => !dismissedIds.has(j.booking_id || j.id || ''));
  const hiddenCount = jobs.length - visibleJobs.length;

  if (loading) {
    return (
      <TechnicianLayout title="Available Jobs" headerTitle="Available Jobs">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout title="Available Jobs" headerTitle="Available Jobs">
      {/* Header with refresh */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Job Feed</h2>
          <p className="text-xs text-gray-500">{visibleJobs.length} jobs available</p>
        </div>
        <button
          onClick={() => fetchJobs(false)}
          disabled={refreshing}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Hidden jobs indicator */}
      {hiddenCount > 0 && (
        <button
          onClick={clearDismissed}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
        >
          <EyeOff className="h-3.5 w-3.5" />
          {hiddenCount} hidden — show all
        </button>
      )}

      {/* Job list */}
      {visibleJobs.length === 0 ? (
        <div className="text-center py-12">
          <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {hiddenCount > 0 ? 'All jobs are hidden' : 'No jobs available right now'}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {hiddenCount > 0
              ? <button onClick={clearDismissed} className="underline hover:text-gray-600">Show hidden jobs</button>
              : 'New jobs will appear automatically'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleJobs.map((job) => {
            const jobId = job.booking_id || job.id || '';
            return (
              <JobCard
                key={jobId}
                job={job}
                onAction={() => claimJob(jobId)}
                actionLabel="Claim This Job"
                actionLoading={claimingId === jobId}
                onDismiss={() => dismissJob(jobId, job.booking_ref)}
                onClick={() => {
                  // Could open a detail view, but for now the card has enough info
                }}
              />
            );
          })}
        </div>
      )}
    </TechnicianLayout>
  );
}
