import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TechnicianLayout from '@/components/technician/TechnicianLayout';
import JobTimeline from '@/components/technician/JobTimeline';
import RepairCompletionForm from '@/components/technician/RepairCompletionForm';
import { techFetch } from '@/utils/technicianAuth';
import {
  Loader2, ArrowLeft, Phone, MapPin, Clock, DollarSign,
  Smartphone, Wrench, User, MessageCircle, Navigation, Shield, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchJob() {
      try {
        const res = await techFetch(`/api/technician/jobs/${id}`);
        if (res.ok) {
          setJob(await res.json());
        } else {
          toast.error('Job not found');
          router.push('/technician/my-jobs');
        }
      } catch {
        toast.error('Failed to load job');
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id, router]);

  const startRepair = async () => {
    setActionLoading(true);
    try {
      const res = await techFetch(`/api/technician/jobs/${id}/start`, { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Repair started!');
        setJob((prev: any) => ({ ...prev, status: 'in-progress' }));
      } else {
        toast.error(data.error || 'Failed to start repair');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const completeRepair = async (formData: { repair_notes: string; repair_duration: number; parts_used: string[] }) => {
    setActionLoading(true);
    try {
      const res = await techFetch(`/api/technician/jobs/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Repair completed! Warranty: ${data.warranty?.warranty_number || 'Created'}`);
        setJob((prev: any) => ({
          ...prev,
          status: 'completed',
          warranty: data.warranty,
          repair_completion: data.repair_completion,
        }));
        setShowCompletionForm(false);
      } else {
        toast.error(data.error || 'Failed to complete repair');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <TechnicianLayout title="Job Detail">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </TechnicianLayout>
    );
  }

  if (!job) return null;

  const deviceName = job.device_models?.name || 'Unknown Device';
  const brandName = job.device_models?.brands?.name || '';
  const serviceName = job.services?.display_name || job.services?.name || 'Repair';
  const cityName = job.service_locations?.city_name || job.city || '';

  // Format date/time
  const bookingDate = job.booking_date
    ? new Date(job.booking_date + 'T00:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  const formatTime = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${period}`;
  };

  return (
    <TechnicianLayout title="Job Detail" headerTitle={job.booking_ref}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <JobTimeline currentStatus={job.status} />
      </div>

      {/* Job Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Job Details</h2>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Smartphone className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {brandName ? `${brandName} ${deviceName}` : deviceName}
              </p>
              <p className="text-xs text-gray-500">Device</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Wrench className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">{serviceName}</p>
              <p className="text-xs text-gray-500">Service</p>
            </div>
          </div>

          {cityName && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">{cityName}</p>
                {job.customer_address && <p className="text-xs text-gray-500">{job.customer_address}</p>}
              </div>
            </div>
          )}

          {bookingDate && (
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {bookingDate}
                  {job.booking_time && ` at ${formatTime(job.booking_time)}`}
                </p>
                <p className="text-xs text-gray-500">Scheduled</p>
              </div>
            </div>
          )}

          {job.quoted_price != null && (
            <div className="flex items-start gap-3">
              <DollarSign className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  ${Number(job.quoted_price).toFixed(2)}
                  {job.pricing_tier && job.pricing_tier !== 'standard' && (
                    <span className="ml-1 text-accent-600 text-xs">({job.pricing_tier})</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">Quoted Price</p>
              </div>
            </div>
          )}

          {job.issue_description && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Issue Description</p>
              <p className="text-sm text-gray-700">{job.issue_description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-900">{job.customer_name}</p>
          </div>

          {job.customer_phone && (
            <a
              href={`tel:${job.customer_phone}`}
              className="flex items-center gap-3 text-sm text-blue-600"
            >
              <Phone className="h-4 w-4" />
              {job.customer_phone}
            </a>
          )}

          {job.customer_phone && (
            <a
              href={`https://wa.me/${job.customer_phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-green-600"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}

          {job.customer_address && (
            <a
              href={`https://maps.google.com/maps?q=${encodeURIComponent(
                `${job.customer_address}, ${job.city || ''}, ${job.province || 'BC'}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-blue-600"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </a>
          )}
        </div>
      </div>

      {/* Warranty Card (if completed) */}
      {job.warranty && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold text-green-800">Warranty Created</h2>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-green-700">
              <span className="font-medium">Number:</span>{' '}
              <span className="font-mono">{job.warranty.warranty_number}</span>
            </p>
            <p className="text-green-700">
              <span className="font-medium">Valid until:</span>{' '}
              {new Date(job.warranty.end_date).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-green-700">
              <span className="font-medium">Duration:</span> {job.warranty.duration_days} days
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        {job.status === 'assigned' && (
          <button
            onClick={startRepair}
            disabled={actionLoading}
            className="w-full py-3 bg-accent-500 text-primary-900 font-bold rounded-xl text-base hover:bg-accent-400 active:bg-accent-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            Start Repair
          </button>
        )}

        {job.status === 'in-progress' && !showCompletionForm && (
          <button
            onClick={() => setShowCompletionForm(true)}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl text-base hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2"
          >
            Complete Repair
          </button>
        )}

        {showCompletionForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Complete Repair</h3>
              <button
                onClick={() => setShowCompletionForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
            </div>
            <RepairCompletionForm
              onSubmit={completeRepair}
              loading={actionLoading}
            />
          </div>
        )}
      </div>
    </TechnicianLayout>
  );
}
