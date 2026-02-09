import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import { techFetch, removeTechAuth } from '@/utils/technicianAuth';
import {
  Loader2, LogOut, MapPin, Star, Briefcase, Wrench, Phone, Mail, Clock, Bell, BellOff
} from 'lucide-react';
import { toast } from 'sonner';
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  hasActivePushSubscription,
  getNotificationPermission,
} from '@/utils/pushSubscription';

export default function TechnicianProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    const checkPush = async () => {
      const supported = isPushSupported();
      setPushSupported(supported);
      if (supported) {
        const active = await hasActivePushSubscription();
        setPushEnabled(active);
      }
    };
    checkPush();
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await techFetch('/api/technician/me');
        if (res.ok) {
          setProfile(await res.json());
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const updateStatus = async (newStatus: string) => {
    setStatusLoading(true);
    try {
      const res = await techFetch('/api/technician/availability', {
        method: 'PUT',
        body: JSON.stringify({ current_status: newStatus }),
      });

      if (res.ok) {
        setProfile((prev: any) => ({ ...prev, current_status: newStatus }));
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setStatusLoading(false);
    }
  };

  const togglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        const ok = await unsubscribeFromPush();
        if (ok) {
          setPushEnabled(false);
          toast.success('Notifications disabled');
        } else {
          toast.error('Failed to disable notifications');
        }
      } else {
        const permission = getNotificationPermission();
        if (permission === 'denied') {
          toast.error('Notifications are blocked. Please enable them in your browser settings.');
          return;
        }
        const ok = await subscribeToPush();
        if (ok) {
          setPushEnabled(true);
          toast.success('Notifications enabled');
        } else {
          toast.error('Failed to enable notifications');
        }
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setPushLoading(false);
    }
  };

  const handleLogout = () => {
    removeTechAuth();
    router.replace('/technician/login');
  };

  if (loading) {
    return (
      <TechnicianLayout title="Profile" headerTitle="Profile">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </TechnicianLayout>
    );
  }

  if (!profile) return null;

  const statusColors: Record<string, string> = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-400',
  };

  return (
    <TechnicianLayout title="Profile" headerTitle="Profile">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 text-center">
        <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-primary-600 text-2xl font-bold">
            {profile.full_name?.charAt(0)?.toUpperCase() || 'T'}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{profile.full_name}</h2>

        <div className="flex items-center justify-center gap-2 mt-2">
          <div className={`h-2.5 w-2.5 rounded-full ${statusColors[profile.current_status] || 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600 capitalize">{profile.current_status}</span>
        </div>

        {/* Status toggle */}
        <div className="flex gap-2 mt-4 justify-center">
          {['available', 'busy', 'offline'].map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={statusLoading || profile.current_status === s}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                profile.current_status === s
                  ? s === 'available' ? 'bg-green-100 text-green-800' : s === 'busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <Briefcase className="h-4 w-4 text-primary-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{profile.total_bookings_completed}</p>
          <p className="text-[10px] text-gray-400">Completed</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <Star className="h-4 w-4 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{profile.rating?.toFixed(1) || '5.0'}</p>
          <p className="text-[10px] text-gray-400">Rating</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
          <Clock className="h-4 w-4 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900">{profile.experience_years || 1}</p>
          <p className="text-[10px] text-gray-400">Years Exp.</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
        <div className="space-y-2 text-sm">
          {profile.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              {profile.phone}
            </div>
          )}
          {profile.whatsapp_number && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 text-green-500" />
              {profile.whatsapp_number}
            </div>
          )}
          {profile.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              {profile.email}
            </div>
          )}
        </div>
      </div>

      {/* Service Zones */}
      {profile.service_zones && profile.service_zones.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Service Zones</h3>
          <div className="flex flex-wrap gap-2">
            {profile.service_zones.map((zone: any) => (
              <span
                key={zone.id}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  zone.is_primary ? 'bg-accent-100 text-accent-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <MapPin className="h-3 w-3" />
                {zone.service_locations?.city_name || 'Unknown'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Specializations */}
      {profile.technician_specializations && profile.technician_specializations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {profile.technician_specializations.map((spec: any) => (
              <span
                key={spec.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <Wrench className="h-3 w-3" />
                {spec.services?.display_name || spec.service_categories?.name || 'General'}
                <span className="opacity-60">({spec.skill_level})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {pushSupported && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {pushEnabled ? (
                <Bell className="h-5 w-5 text-primary-600" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-500">
                  {getNotificationPermission() === 'denied'
                    ? 'Blocked in browser settings'
                    : pushEnabled
                      ? 'You\'ll be notified of new jobs'
                      : 'Get alerts when new jobs are available'}
                </p>
              </div>
            </div>
            <button
              onClick={togglePush}
              disabled={pushLoading || getNotificationPermission() === 'denied'}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                pushEnabled ? 'bg-primary-600' : 'bg-gray-300'
              } ${(pushLoading || getNotificationPermission() === 'denied') ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  pushEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full mt-4 py-3 bg-red-50 text-red-600 font-medium rounded-xl text-sm border border-red-200 hover:bg-red-100 active:bg-red-200 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </TechnicianLayout>
  );
}
