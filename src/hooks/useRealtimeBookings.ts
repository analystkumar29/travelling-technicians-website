import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';

interface UseRealtimeBookingsOptions {
  onNewBooking?: (booking: Record<string, unknown>) => void;
  enabled?: boolean;
}

export function useRealtimeBookings({ onNewBooking, enabled = true }: UseRealtimeBookingsOptions = {}) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const handleNewBooking = useCallback(
    (payload: { new: Record<string, unknown> }) => {
      const booking = payload.new;
      const ref = (booking.booking_ref as string) || 'New booking';
      const name = (booking.customer_name as string) || 'Unknown';

      toast.info(`New booking: ${ref}`, {
        description: `From ${name}`,
        duration: 8000,
      });

      onNewBooking?.(booking);
    },
    [onNewBooking]
  );

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('admin-bookings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        handleNewBooking
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [enabled, handleNewBooking]);
}
