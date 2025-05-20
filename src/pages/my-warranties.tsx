import React, { useEffect, useState, useContext } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { AuthContext } from '@/context/AuthContext';
import AuthProtectedRoute from '@/components/AuthProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { supabase } from '@/utils/supabaseClient';
import WarrantyCard from '@/components/warranty/WarrantyCard';
import { WarrantySummary } from '@/types/warranty';

const MyWarrantiesPage: NextPage = () => {
  const [warranties, setWarranties] = useState<WarrantySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useContext(AuthContext);
  const { user, isLoading: authLoading } = auth || {};
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Fetch user's warranties when component mounts
  useEffect(() => {
    async function fetchWarranties() {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/warranties?customer_email=${encodeURIComponent(user.email)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch warranties');
        }
        
        const data = await response.json();
        setWarranties(data);
      } catch (err) {
        console.error('Error fetching warranties:', err);
        setError('Unable to load your warranties. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    if (!authLoading) {
      fetchWarranties();
    }
  }, [user, authLoading]);
  
  // Handle warranty claim
  const handleClaimWarranty = (warrantyCode: string) => {
    router.push(`/warranty-claim?code=${warrantyCode}`);
  };
  
  // Render appropriate content based on loading/auth state
  const renderContent = () => {
    if (authLoading || loading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-blue-200 rounded-full"></div>
            <div className="mt-4 h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      );
    }
    
    if (!user) {
      return (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-6">Please sign in to view your warranties.</p>
          <button 
            onClick={() => router.push('/login?redirect=/my-warranties')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Sign In
          </button>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-10">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    if (warranties.length === 0) {
      return (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-4">No Warranties Found</h2>
          <p className="mb-6">You don't have any active warranties at the moment.</p>
          <button 
            onClick={() => router.push('/book-online')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Book a Repair
          </button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warranties.map((warranty) => (
          <WarrantyCard 
            key={warranty.warranty_code} 
            warranty={warranty} 
            onClaimClick={handleClaimWarranty}
          />
        ))}
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">My Warranties</h1>
        <p className="text-gray-600 mb-8">View and manage your warranty details</p>
        
        {renderContent()}
      </div>
    </Layout>
  );
};

export default MyWarrantiesPage; 