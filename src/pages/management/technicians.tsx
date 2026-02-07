import { authFetch } from '@/utils/auth';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
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
  MapPin
} from 'lucide-react';
import { TechnicianRecord } from '@/types/admin';
import { toast } from 'sonner';

interface TechnicianWithZones extends TechnicianRecord {
  service_zones?: any[];
}

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

  useEffect(() => {
    fetchTechnicians();
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleTechnicianStatus(technician.id, technician.is_active)}
                            className={`px-3 py-1 rounded text-sm ${technician.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          >
                            {technician.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => setShowServiceZones(technician.id === showServiceZones ? null : technician.id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                          >
                            <MapPin className="h-4 w-4 inline mr-1" />
                            Zones
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
            <h3 className="text-lg font-medium text-gray-900">Service Zones</h3>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-600 mb-4">Service zones management coming soon...</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
