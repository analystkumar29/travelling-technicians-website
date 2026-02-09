import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { addTechNotification } from '@/components/technician/TechnicianNotificationBell';

interface UseTechnicianRealtimeJobsOptions {
  onNewJob?: () => void;
  enabled?: boolean;
}

export function useTechnicianRealtimeJobs({ onNewJob, enabled = true }: UseTechnicianRealtimeJobsOptions = {}) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const handleInsert = useCallback(
    (payload: { new: Record<string, unknown> }) => {
      const booking = payload.new;
      const status = booking.status as string;

      // Only notify for confirmed bookings (available to claim)
      if (status !== 'confirmed' && status !== 'pending') return;

      const ref = (booking.booking_ref as string) || 'New job';
      const name = (booking.customer_name as string) || '';

      const message = name ? `New job available: ${ref} from ${name}` : `New job available: ${ref}`;
      toast.info('New Job Available', { description: message, duration: 6000 });
      addTechNotification('new_job', message);
      onNewJob?.();
    },
    [onNewJob]
  );

  const handleUpdate = useCallback(
    (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => {
      const booking = payload.new;
      const oldStatus = (payload.old as Record<string, unknown>)?.status as string | undefined;
      const newStatus = booking.status as string;

      // Notify when a job gets claimed (assigned) by another tech
      if (newStatus === 'assigned' && oldStatus !== 'assigned') {
        const ref = (booking.booking_ref as string) || 'A job';
        const message = `${ref} was claimed by another technician`;
        addTechNotification('job_claimed', message);
      }
    },
    []
  );

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('tech-realtime-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, handleInsert)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, handleUpdate)
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [enabled, handleInsert, handleUpdate]);
}
