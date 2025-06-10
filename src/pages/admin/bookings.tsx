import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/utils/supabaseClient';

interface Booking {
  id: string;
  reference_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  device_type: string;
  device_brand: string;
  device_model: string;
  service_type: string;
  issue_description: string;
  booking_date: string;
  booking_time: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
  status: string;
  created_at: string;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setBookings(data || []);
      }
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        alert('Error updating status: ' + error.message);
      } else {
        // Refresh bookings
        fetchBookings();
      }
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">Loading bookings...</div>
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
            <div className="text-center text-red-600">Error: {error}</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="mt-2 text-gray-600">Manage customer bookings and appointments</p>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {booking.reference_number}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {booking.customer_name} - {booking.customer_email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Device:</strong> {booking.device_brand} {booking.device_model}
                        </div>
                        <div>
                          <strong>Service:</strong> {booking.service_type}
                        </div>
                        <div>
                          <strong>Date:</strong> {booking.booking_date} at {booking.booking_time}
                        </div>
                        <div>
                          <strong>Phone:</strong> {booking.customer_phone}
                        </div>
                        <div>
                          <strong>Address:</strong> {booking.address}, {booking.postal_code}
                        </div>
                        <div>
                          <strong>Created:</strong> {new Date(booking.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {booking.issue_description && (
                        <div className="mt-2">
                          <strong className="text-sm text-gray-600">Issue:</strong>
                          <p className="text-sm text-gray-800">{booking.issue_description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      disabled={booking.status === 'confirmed'}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                      disabled={booking.status === 'in_progress'}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      disabled={booking.status === 'completed'}
                    >
                      Complete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            
            {bookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No bookings found
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 