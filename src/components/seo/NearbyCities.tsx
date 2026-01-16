import React from 'react';
import Link from 'next/link';
import { FaMapMarkerAlt, FaCar } from 'react-icons/fa';
import { getNearbyLocations } from '@/lib/data-service';

export interface NearbyCity {
  id: number;
  city: string;
  slug: string;
  distanceKm: number;
}

export interface NearbyCitiesProps {
  currentCitySlug: string;
  currentServiceSlug: string;
  currentModelSlug: string;
  maxCities?: number;
  showDistance?: boolean;
  showPriceAdjustment?: boolean;
  className?: string;
}

export default function NearbyCities({
  currentCitySlug,
  currentServiceSlug,
  currentModelSlug,
  maxCities = 3,
  showDistance = true,
  showPriceAdjustment = false,
  className = ''
}: NearbyCitiesProps) {
  const [nearbyCities, setNearbyCities] = React.useState<NearbyCity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchNearbyCities() {
      try {
        setLoading(true);
        const cities = await getNearbyLocations(currentCitySlug);
        
        // Filter out the current city and limit to maxCities
        const filteredCities = cities
          .filter(city => city.slug !== currentCitySlug)
          .slice(0, maxCities);
        
        setNearbyCities(filteredCities);
        setError(null);
      } catch (err) {
        console.error('Error fetching nearby cities:', err);
        setError('Unable to load nearby cities');
        setNearbyCities([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNearbyCities();
  }, [currentCitySlug, maxCities]);

  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-xl p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <FaMapMarkerAlt className="text-accent-600 mr-2" />
          <h3 className="text-xl font-bold">Nearby Service Areas</h3>
        </div>
        <div className="space-y-3">
          {[...Array(maxCities)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || nearbyCities.length === 0) {
    // Don't show anything if there's an error or no nearby cities
    return null;
  }

  return (
    <div className={`bg-gray-50 rounded-xl p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <FaMapMarkerAlt className="text-accent-600 mr-2" />
        <h3 className="text-xl font-bold">Also Serving Nearby Areas</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Our certified technicians also provide {currentServiceSlug.replace('-', ' ')} services in these nearby locations:
      </p>
      
      <div className="space-y-4">
        {nearbyCities.map((city) => (
          <div 
            key={city.id} 
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-accent-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <Link
                  href={`/repair/${city.slug}/${currentServiceSlug}/${currentModelSlug}`}
                  className="text-lg font-semibold text-primary-700 hover:text-accent-600 transition-colors"
                >
                  {city.city}
                </Link>
                
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <FaCar className="mr-1" />
                  {showDistance && (
                    <span className="mr-3">
                      {city.distanceKm < 1
                        ? 'Less than 1 km away'
                        : `${city.distanceKm.toFixed(1)} km away`
                      }
                    </span>
                  )}
                  
                  {/* Note: price_adjustment_percentage is not returned by getNearbyLocations */}
                  {/* We could fetch it separately if needed, but for now we'll hide this section */}
                  {showPriceAdjustment && false && (
                    <span className={`font-medium ${
                      false
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {''}% price adjustment
                    </span>
                  )}
                </div>
              </div>
              
              <Link
                href={`/repair/${city.slug}/${currentServiceSlug}/${currentModelSlug}`}
                className="text-accent-600 hover:text-accent-700 font-medium text-sm px-3 py-1 border border-accent-300 rounded-full hover:bg-accent-50 transition-colors"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link
          href="/service-areas"
          className="text-primary-600 hover:text-accent-600 font-medium text-sm flex items-center"
        >
          <FaMapMarkerAlt className="mr-2" />
          View all service areas
        </Link>
      </div>
    </div>
  );
}