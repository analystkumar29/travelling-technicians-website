import { authFetch } from '@/utils/auth';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminModal from '@/components/admin/AdminModal';
import { supabase } from '@/utils/supabaseClient';
import {
  Users,
  Plus,
  MessageCircle,
  Star,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  Pencil,
  Calendar,
  Trash2
} from 'lucide-react';
import {
  TechnicianRecord,
  TechnicianServiceZoneRecord,
  TechnicianAvailabilityRecord,
  ServiceLocationRecord
} from '@/types/admin';
import { toast } from 'sonner';

interface TechnicianWithZones extends TechnicianRecord {
  service_zones?: TechnicianServiceZoneRecord[];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminTechnicians() {
  const [technicians, setTechnicians] = useState<TechnicianWithZones[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showServiceZones, setShowServiceZones] = useState<string | null>(null);
  const [newTechnician, setNewTechnician] = useState({
    full_name: '',
    whatsapp_number: '',
    email: '',
    hourly_rate: 25.00,
    max_daily_appointments: 100
  });

  // Edit modal state
  const [editingTechnician, setEditingTechnician] = useState<TechnicianRecord | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    whatsapp_number: '',
    email: '',
    phone: '',
    hourly_rate: 25.00,
    max_daily_appointments: 100,
    experience_years: 1,
    specializations: '',
    notes: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Service zones state
  const [serviceZones, setServiceZones] = useState<TechnicianServiceZoneRecord[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [locations, setLocations] = useState<ServiceLocationRecord[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [addingZone, setAddingZone] = useState(false);

  // Availability state
  const [showAvailability, setShowAvailability] = useState<string | null>(null);
  const [availability, setAvailability] = useState<TechnicianAvailabilityRecord[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [addingAvailDay, setAddingAvailDay] = useState<number | null>(null);
  const [newAvailability, setNewAvailability] = useState({
    start_time: '09:00',
    end_time: '17:00'
  });

  useEffect(() => {
    fetchTechnicians();
    fetchLocations();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/technicians');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTechnicians(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch technicians');
      console.error('Technician fetch error:', err);
      toast.error('Failed to fetch technicians');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data, error: locError } = await supabase
        .from('service_locations')
        .select('id, city_name, slug, base_travel_fee, travel_fee_rules, is_active, created_at')
        .eq('is_active', true)
        .order('city_name');

      if (locError) {
        console.error('Error fetching locations:', locError);
        return;
      }
      setLocations((data as ServiceLocationRecord[]) || []);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const fetchServiceZones = useCallback(async (technicianId: string) => {
    try {
      setLoadingZones(true);
      const response = await authFetch(`/api/technicians/service-zones?technician_id=${technicianId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch service zones');
      }

      const data = await response.json();
      setServiceZones(data || []);
    } catch (err) {
      console.error('Error fetching service zones:', err);
      toast.error('Failed to load service zones');
      setServiceZones([]);
    } finally {
      setLoadingZones(false);
    }
  }, []);

  const fetchAvailability = useCallback(async (technicianId: string) => {
    try {
      setLoadingAvailability(true);
      const response = await authFetch(`/api/technicians/availability?technician_id=${technicianId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      setAvailability(data || []);
    } catch (err) {
      console.error('Error fetching availability:', err);
      toast.error('Failed to load availability');
      setAvailability([]);
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  // When showServiceZones changes, fetch zones
  useEffect(() => {
    if (showServiceZones) {
      fetchServiceZones(showServiceZones);
    } else {
      setServiceZones([]);
    }
  }, [showServiceZones, fetchServiceZones]);

  // When showAvailability changes, fetch availability
  useEffect(() => {
    if (showAvailability) {
      fetchAvailability(showAvailability);
    } else {
      setAvailability([]);
    }
  }, [showAvailability, fetchAvailability]);

  const toggleTechnicianStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await authFetch(`/api/technicians?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error updating technician status: ' + errorData.error);
      } else {
        toast.success(`Technician ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        await fetchTechnicians();
      }
    } catch (err) {
      toast.error('Failed to update technician status');
    }
  };

  const updateTechnicianStatus = async (id: string, status: 'available' | 'busy' | 'offline') => {
    try {
      const response = await authFetch(`/api/technicians?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_status: status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error updating technician status: ' + errorData.error);
      } else {
        toast.success(`Technician status updated to ${status}`);
        await fetchTechnicians();
      }
    } catch (err) {
      toast.error('Failed to update technician status');
    }
  };

  const addTechnician = async () => {
    try {
      const response = await authFetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTechnician,
          whatsapp_capable: true,
          current_status: 'available',
          is_active: true,
          specializations: ['mobile', 'laptop'],
          experience_years: 1,
          rating: 5.00,
          total_bookings_completed: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error adding technician: ' + errorData.error);
      } else {
        toast.success('Technician added successfully');
        setShowAddForm(false);
        setNewTechnician({
          full_name: '',
          whatsapp_number: '',
          email: '',
          hourly_rate: 25.00,
          max_daily_appointments: 100
        });
        await fetchTechnicians();
      }
    } catch (err) {
      toast.error('Failed to add technician');
    }
  };

  // --- Edit Technician ---
  const openEditModal = (technician: TechnicianRecord) => {
    setEditingTechnician(technician);
    setEditForm({
      full_name: technician.full_name || '',
      whatsapp_number: technician.whatsapp_number || '',
      email: technician.email || '',
      phone: technician.phone || '',
      hourly_rate: technician.hourly_rate ?? 25.00,
      max_daily_appointments: technician.max_daily_appointments ?? 100,
      experience_years: technician.experience_years ?? 1,
      specializations: (technician.specializations || []).join(', '),
      notes: technician.notes || ''
    });
  };

  const saveEditTechnician = async () => {
    if (!editingTechnician) return;

    try {
      setSavingEdit(true);

      const specializations = editForm.specializations
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const response = await authFetch(`/api/technicians?id=${editingTechnician.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: editForm.full_name,
          whatsapp_number: editForm.whatsapp_number,
          email: editForm.email || null,
          phone: editForm.phone || null,
          hourly_rate: editForm.hourly_rate,
          max_daily_appointments: editForm.max_daily_appointments,
          experience_years: editForm.experience_years,
          specializations,
          notes: editForm.notes || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error saving technician: ' + errorData.error);
      } else {
        toast.success('Technician updated successfully');
        setEditingTechnician(null);
        await fetchTechnicians();
      }
    } catch (err) {
      toast.error('Failed to save technician');
    } finally {
      setSavingEdit(false);
    }
  };

  // --- Service Zones ---
  const addServiceZone = async () => {
    if (!showServiceZones || !selectedLocationId) return;

    try {
      setAddingZone(true);
      const nextPriority = serviceZones.length + 1;

      const response = await authFetch('/api/technicians/service-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technician_id: showServiceZones,
          location_id: selectedLocationId,
          priority: nextPriority,
          is_primary: serviceZones.length === 0 // First zone is primary
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error adding service zone: ' + errorData.error);
      } else {
        toast.success('Service zone added');
        setSelectedLocationId('');
        await fetchServiceZones(showServiceZones);
      }
    } catch (err) {
      toast.error('Failed to add service zone');
    } finally {
      setAddingZone(false);
    }
  };

  const removeServiceZone = async (zoneId: string) => {
    if (!showServiceZones) return;

    try {
      const response = await authFetch(`/api/technicians/service-zones?id=${zoneId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error removing service zone: ' + errorData.error);
      } else {
        toast.success('Service zone removed');
        await fetchServiceZones(showServiceZones);
      }
    } catch (err) {
      toast.error('Failed to remove service zone');
    }
  };

  // --- Availability ---
  const addAvailability = async (dayOfWeek: number) => {
    if (!showAvailability) return;

    try {
      const response = await authFetch('/api/technicians/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technician_id: showAvailability,
          day_of_week: dayOfWeek,
          start_time: newAvailability.start_time,
          end_time: newAvailability.end_time,
          is_available: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error adding availability: ' + errorData.error);
      } else {
        toast.success(`${DAY_NAMES[dayOfWeek]} availability added`);
        setAddingAvailDay(null);
        setNewAvailability({ start_time: '09:00', end_time: '17:00' });
        await fetchAvailability(showAvailability);
      }
    } catch (err) {
      toast.error('Failed to add availability');
    }
  };

  const updateAvailability = async (availId: string, updates: Partial<TechnicianAvailabilityRecord>) => {
    if (!showAvailability) return;

    try {
      const response = await authFetch(`/api/technicians/availability?id=${availId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error updating availability: ' + errorData.error);
      } else {
        toast.success('Availability updated');
        await fetchAvailability(showAvailability);
      }
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const deleteAvailability = async (availId: string) => {
    if (!showAvailability) return;

    try {
      const response = await authFetch(`/api/technicians/availability?id=${availId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error('Error deleting availability: ' + errorData.error);
      } else {
        toast.success('Availability removed');
        await fetchAvailability(showAvailability);
      }
    } catch (err) {
      toast.error('Failed to delete availability');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  // Helper: get assigned location IDs for filtering the dropdown
  const assignedLocationIds = new Set(serviceZones.map(z => z.location_id));
  const availableLocations = locations.filter(l => !assignedLocationIds.has(l.id));

  // Helper: get days that already have availability
  const availabilityByDay = new Map<number, TechnicianAvailabilityRecord>();
  availability.forEach(a => availabilityByDay.set(a.day_of_week, a));

  // Get the selected technician name for panel headers
  const getSelectedTechnicianName = (id: string | null) => {
    if (!id) return '';
    const tech = technicians.find(t => t.id === id);
    return tech ? tech.full_name : '';
  };

  if (loading) {
    return (
      <AdminLayout title="Technician Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading technicians...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Technician Management">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Technician Management">
      <AdminPageHeader
        title="Technician Management"
        description="Manage your team of repair technicians"
        actions={
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Technician
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <AdminStatsCard
          label="Total Technicians"
          value={technicians.length}
          icon={Users}
          color="blue"
        />
        <AdminStatsCard
          label="Available Now"
          value={technicians.filter(t => t.current_status === 'available').length}
          icon={CheckCircle}
          color="green"
        />
        <AdminStatsCard
          label="Avg Rating"
          value={
            technicians.length > 0
              ? (technicians.reduce((sum, t) => sum + t.rating, 0) / technicians.length).toFixed(1)
              : '5.0'
          }
          icon={Star}
          color="amber"
        />
        <AdminStatsCard
          label="Total Bookings"
          value={technicians.reduce((sum, t) => sum + t.total_bookings_completed, 0)}
          icon={Briefcase}
          color="purple"
        />
      </div>

      {/* Add Technician Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Add New Technician</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={newTechnician.full_name}
                  onChange={(e) => setNewTechnician({ ...newTechnician, full_name: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    value={newTechnician.whatsapp_number}
                    onChange={(e) => setNewTechnician({ ...newTechnician, whatsapp_number: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={newTechnician.email}
                  onChange={(e) => setNewTechnician({ ...newTechnician, email: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTechnician.hourly_rate}
                  onChange={(e) => setNewTechnician({ ...newTechnician, hourly_rate: parseFloat(e.target.value) })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="25.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Daily Appointments</label>
                <input
                  type="number"
                  value={newTechnician.max_daily_appointments}
                  onChange={(e) => setNewTechnician({ ...newTechnician, max_daily_appointments: parseInt(e.target.value) })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="100"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addTechnician}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Technician
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technicians Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Technician List ({technicians.length})
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {technicians.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No technicians found. Add your first technician!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {technicians.map((technician) => (
                    <tr key={technician.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {technician.full_name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {technician.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {technician.experience_years} years experience
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 text-green-500 mr-2" />
                            {technician.whatsapp_number}
                          </div>
                          {technician.email && (
                            <div className="text-sm text-gray-500 mt-1">
                              {technician.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(technician.current_status)}`}>
                            {getStatusText(technician.current_status)}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateTechnicianStatus(technician.id, 'available')}
                              className={`text-xs px-2 py-1 rounded ${technician.current_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              Available
                            </button>
                            <button
                              onClick={() => updateTechnicianStatus(technician.id, 'busy')}
                              className={`text-xs px-2 py-1 rounded ${technician.current_status === 'busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              Busy
                            </button>
                            <button
                              onClick={() => updateTechnicianStatus(technician.id, 'offline')}
                              className={`text-xs px-2 py-1 rounded ${technician.current_status === 'offline' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              Offline
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-2" />
                            {technician.rating.toFixed(1)} / 5.0
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <Briefcase className="h-4 w-4 inline mr-1" />
                            {technician.total_bookings_completed} bookings
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <DollarSign className="h-4 w-4 inline mr-1" />
                            ${technician.hourly_rate}/hour
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openEditModal(technician)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                          >
                            <Pencil className="h-4 w-4 inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => toggleTechnicianStatus(technician.id, technician.is_active)}
                            className={`px-3 py-1 rounded text-sm ${technician.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          >
                            {technician.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              setShowServiceZones(technician.id === showServiceZones ? null : technician.id);
                              if (technician.id !== showAvailability) setShowAvailability(null);
                            }}
                            className={`px-3 py-1 rounded text-sm ${showServiceZones === technician.id ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                          >
                            <MapPin className="h-4 w-4 inline mr-1" />
                            Zones
                          </button>
                          <button
                            onClick={() => {
                              setShowAvailability(technician.id === showAvailability ? null : technician.id);
                              if (technician.id !== showServiceZones) setShowServiceZones(null);
                            }}
                            className={`px-3 py-1 rounded text-sm ${showAvailability === technician.id ? 'bg-purple-200 text-purple-800' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                          >
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Schedule
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Service Zones Panel */}
      {showServiceZones && (
        <div className="bg-white shadow rounded-lg mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              <MapPin className="h-5 w-5 inline mr-2 text-blue-600" />
              Service Zones — {getSelectedTechnicianName(showServiceZones)}
            </h3>
          </div>
          <div className="px-6 py-4">
            {loadingZones ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading service zones...</span>
              </div>
            ) : (
              <>
                {/* Current zones list */}
                {serviceZones.length === 0 ? (
                  <p className="text-gray-500 mb-4">No service zones assigned yet.</p>
                ) : (
                  <div className="mb-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Travel Fee Adj.</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {serviceZones.map((zone) => (
                          <tr key={zone.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {zone.location?.city_name || 'Unknown'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              #{zone.priority}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {zone.is_primary ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Primary
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  Secondary
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {zone.service_fee_adjustment !== 0
                                ? `$${zone.service_fee_adjustment.toFixed(2)}`
                                : '--'}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <button
                                onClick={() => removeServiceZone(zone.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove zone"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add zone form */}
                <div className="flex items-end gap-3 border-t border-gray-200 pt-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Add City</label>
                    <select
                      value={selectedLocationId}
                      onChange={(e) => setSelectedLocationId(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                      <option value="">Select a city...</option>
                      {availableLocations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.city_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={addServiceZone}
                    disabled={!selectedLocationId || addingZone}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {addingZone ? 'Adding...' : 'Add Zone'}
                  </button>
                </div>

                {availableLocations.length === 0 && locations.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">All available cities have been assigned.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Availability Schedule Panel */}
      {showAvailability && (
        <div className="bg-white shadow rounded-lg mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              <Calendar className="h-5 w-5 inline mr-2 text-purple-600" />
              Weekly Schedule — {getSelectedTechnicianName(showAvailability)}
            </h3>
          </div>
          <div className="px-6 py-4">
            {loadingAvailability ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading schedule...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {DAY_NAMES.map((dayName, dayIndex) => {
                  const dayAvail = availabilityByDay.get(dayIndex);
                  const isAddingThisDay = addingAvailDay === dayIndex;

                  return (
                    <div
                      key={dayIndex}
                      className="flex items-center gap-4 px-4 py-3 border border-gray-200 rounded-lg"
                    >
                      {/* Day name */}
                      <div className="w-28 font-medium text-sm text-gray-900">{dayName}</div>

                      {dayAvail ? (
                        <>
                          {/* Toggle */}
                          <button
                            onClick={() =>
                              updateAvailability(dayAvail.id, { is_available: !dayAvail.is_available })
                            }
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                              dayAvail.is_available ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                                dayAvail.is_available ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          {/* Time inputs */}
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={dayAvail.start_time?.slice(0, 5) || '09:00'}
                              onChange={(e) =>
                                updateAvailability(dayAvail.id, { start_time: e.target.value })
                              }
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                            <span className="text-gray-500 text-sm">to</span>
                            <input
                              type="time"
                              value={dayAvail.end_time?.slice(0, 5) || '17:00'}
                              onChange={(e) =>
                                updateAvailability(dayAvail.id, { end_time: e.target.value })
                              }
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>

                          {/* Status badge */}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              dayAvail.is_available
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {dayAvail.is_available ? 'Available' : 'Off'}
                          </span>

                          {/* Delete */}
                          <button
                            onClick={() => deleteAvailability(dayAvail.id)}
                            className="ml-auto text-red-500 hover:text-red-700"
                            title="Remove this day"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : isAddingThisDay ? (
                        <>
                          {/* Add form inline */}
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={newAvailability.start_time}
                              onChange={(e) =>
                                setNewAvailability({ ...newAvailability, start_time: e.target.value })
                              }
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                            <span className="text-gray-500 text-sm">to</span>
                            <input
                              type="time"
                              value={newAvailability.end_time}
                              onChange={(e) =>
                                setNewAvailability({ ...newAvailability, end_time: e.target.value })
                              }
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>
                          <button
                            onClick={() => addAvailability(dayIndex)}
                            className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setAddingAvailDay(null)}
                            className="px-3 py-1 border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {/* No availability - show add button */}
                          <span className="text-sm text-gray-400">Not configured</span>
                          <button
                            onClick={() => {
                              setAddingAvailDay(dayIndex);
                              setNewAvailability({ start_time: '09:00', end_time: '17:00' });
                            }}
                            className="ml-auto px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                          >
                            <Plus className="h-3 w-3 inline mr-1" />
                            Add
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Technician Modal */}
      <AdminModal
        open={!!editingTechnician}
        onClose={() => setEditingTechnician(null)}
        title="Edit Technician"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setEditingTechnician(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveEditTechnician}
              disabled={savingEdit}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
            <input
              type="tel"
              value={editForm.whatsapp_number}
              onChange={(e) => setEditForm({ ...editForm, whatsapp_number: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
            <input
              type="number"
              step="0.01"
              value={editForm.hourly_rate}
              onChange={(e) => setEditForm({ ...editForm, hourly_rate: parseFloat(e.target.value) || 0 })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Daily Appointments</label>
            <input
              type="number"
              value={editForm.max_daily_appointments}
              onChange={(e) => setEditForm({ ...editForm, max_daily_appointments: parseInt(e.target.value) || 0 })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
            <input
              type="number"
              value={editForm.experience_years}
              onChange={(e) => setEditForm({ ...editForm, experience_years: parseInt(e.target.value) || 0 })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specializations</label>
            <input
              type="text"
              value={editForm.specializations}
              onChange={(e) => setEditForm({ ...editForm, specializations: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="mobile, laptop, tablet"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated list</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Administrative notes..."
            />
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
