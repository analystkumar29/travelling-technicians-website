import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';
import { 
  FaUser, 
  FaUsers, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaTools,
  FaMapMarkerAlt
} from 'react-icons/fa';

interface Technician {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specializations: string[];
  active_service_areas: string[];
  is_active: boolean;
  hourly_rate: number;
  max_daily_bookings: number;
  created_at: string;
}

export default function AdminTechnicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTechnician, setNewTechnician] = useState({
    full_name: '',
    email: '',
    phone: '',
    specializations: [],
    active_service_areas: [],
    hourly_rate: 0,
    max_daily_bookings: 5
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setTechnicians(data || []);
      }
    } catch (err) {
      setError('Failed to fetch technicians');
      console.error('Technician fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTechnicianStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('technicians')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        alert('Error updating technician status: ' + error.message);
      } else {
        await fetchTechnicians();
      }
    } catch (err) {
      alert('Failed to update technician status');
    }
  };

  const addTechnician = async () => {
    try {
      const { error } = await supabase
        .from('technicians')
        .insert([{
          ...newTechnician,
          is_active: true
        }]);

      if (error) {
        alert('Error adding technician: ' + error.message);
      } else {
        setShowAddForm(false);
        setNewTechnician({
          full_name: '',
          email: '',
          phone: '',
          specializations: [],
          active_service_areas: [],
          hourly_rate: 0,
          max_daily_bookings: 5
        });
        await fetchTechnicians();
      }
    } catch (err) {
      alert('Failed to add technician');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading technicians...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FaUsers className="mr-3" />
                  Technician Management
                </h1>
                <p className="mt-2 text-gray-600">Manage your team of technicians (Future Feature)</p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center"
                >
                  <FaPlus className="mr-2" />
                  Add Technician
                </button>
              </div>
            </div>
          </div>

          {/* Current Setup Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <FaUser className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-blue-900">Solo Operation Mode</h3>
                <p className="text-blue-700 mt-1">
                  You're currently operating solo. This section will be useful when you're ready to hire additional technicians. 
                  For now, all repairs are assigned to you by default.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaUsers className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Technicians</dt>
                      <dd className="text-lg font-medium text-gray-900">{technicians.length || 1}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-500">
                  {technicians.length === 0 ? 'You (Solo)' : `${technicians.filter(t => t.is_active).length} active`}
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaCheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {technicians.filter(t => t.is_active).length || 1}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaTools className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Specializations</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {technicians.length > 0 ? 'Mobile & Laptop' : 'All Services'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={newTechnician.full_name}
                      onChange={(e) => setNewTechnician({ ...newTechnician, full_name: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newTechnician.email}
                      onChange={(e) => setNewTechnician({ ...newTechnician, email: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={newTechnician.phone}
                      onChange={(e) => setNewTechnician({ ...newTechnician, phone: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
                    <input
                      type="number"
                      value={newTechnician.hourly_rate}
                      onChange={(e) => setNewTechnician({ ...newTechnician, hourly_rate: parseFloat(e.target.value) })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addTechnician}
                    disabled={!newTechnician.full_name || !newTechnician.email}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                  >
                    Add Technician
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Technicians List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Technician Team</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {technicians.length === 0 ? (
                <li className="px-6 py-8 text-center">
                  <div className="text-center">
                    <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Solo Operation</h3>
                    <p className="text-gray-500 mb-4">
                      You're currently the only technician. When you're ready to scale, you can add team members here.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <FaUser className="h-6 w-6 text-blue-600 mr-3" />
                        <div className="text-left">
                          <h4 className="font-medium text-blue-900">You (Owner/Technician)</h4>
                          <p className="text-sm text-blue-700">Handling all repairs and customer service</p>
                          <p className="text-sm text-blue-600">Status: Active • Specialization: All Services</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ) : (
                technicians.map((technician) => (
                  <li key={technician.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 flex items-center">
                              <FaUser className="mr-2 text-primary-600" />
                              {technician.full_name}
                            </h4>
                            <p className="text-sm text-gray-500">{technician.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                              technician.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {technician.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <FaPhone className="mr-1" />
                            <a href={`tel:${technician.phone}`} className="text-blue-600 hover:text-blue-800">
                              {technician.phone}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <FaEnvelope className="mr-1" />
                            <a href={`mailto:${technician.email}`} className="text-blue-600 hover:text-blue-800">
                              {technician.email}
                            </a>
                          </div>
                          <div>
                            <strong>Rate:</strong> ${technician.hourly_rate}/hour
                          </div>
                          <div>
                            <strong>Max Daily Bookings:</strong> {technician.max_daily_bookings}
                          </div>
                          <div>
                            <strong>Joined:</strong> {new Date(technician.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {technician.specializations && technician.specializations.length > 0 && (
                          <div className="mb-2">
                            <strong className="text-sm text-gray-600">Specializations:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {technician.specializations.map((spec, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {technician.active_service_areas && technician.active_service_areas.length > 0 && (
                          <div className="mb-2">
                            <strong className="text-sm text-gray-600">Service Areas:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {technician.active_service_areas.map((area, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => toggleTechnicianStatus(technician.id, technician.is_active)}
                        className={`px-3 py-1 text-sm rounded ${
                          technician.is_active
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {technician.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Edit
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
} 