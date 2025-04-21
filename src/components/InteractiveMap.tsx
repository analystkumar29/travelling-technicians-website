import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { DynamicOptionsLoadingProps } from 'next/dynamic';

// Define interfaces outside of dynamic components
interface AreaData {
  id: string;
  name: string;
  description: string;
  popular: boolean;
  sameDay: boolean;
  image?: string;
  coordinates: [number, number]; // [latitude, longitude]
}

interface InteractiveMapProps {
  height?: string;
  className?: string;
  serviceAreas?: AreaData[];
}

// Enhanced service areas data
const enhancedServiceAreas: AreaData[] = [
  {
    id: 'vancouver',
    name: 'Vancouver',
    description: 'Serving all Vancouver neighborhoods including Downtown, Kitsilano, Point Grey, West End, Yaletown, Mount Pleasant, Commercial Drive, and more.',
    popular: true,
    sameDay: true,
    coordinates: [49.2827, -123.1207],
  },
  {
    id: 'burnaby',
    name: 'Burnaby',
    description: 'Full service coverage across Burnaby including Metrotown, Brentwood, Lougheed, and SFU areas with fast response times.',
    popular: true,
    sameDay: true,
    coordinates: [49.2488, -122.9805],
  },
  {
    id: 'richmond',
    name: 'Richmond',
    description: 'Serving all Richmond areas including City Centre, Steveston, East Richmond, and around YVR Airport.',
    popular: true,
    sameDay: true,
    coordinates: [49.1666, -123.1336],
  },
  {
    id: 'surrey',
    name: 'Surrey',
    description: 'Comprehensive coverage across Surrey including Whalley, Guildford, Fleetwood, Newton, and Cloverdale areas.',
    popular: true,
    sameDay: true,
    coordinates: [49.1913, -122.8490],
  },
  {
    id: 'coquitlam',
    name: 'Coquitlam',
    description: 'Service throughout Coquitlam including Maillardville, Town Centre, Westwood Plateau, and Burke Mountain.',
    popular: false,
    sameDay: true,
    coordinates: [49.2838, -122.7932],
  },
  {
    id: 'port-coquitlam',
    name: 'Port Coquitlam',
    description: 'Doorstep repair service available throughout Port Coquitlam with efficient scheduling options.',
    popular: false,
    sameDay: true,
    coordinates: [49.2626, -122.7810],
  },
  {
    id: 'port-moody',
    name: 'Port Moody',
    description: 'Serving the Port Moody area including Glenayre, Heritage Mountain, and Inlet Centre.',
    popular: false,
    sameDay: true,
    coordinates: [49.2849, -122.8553],
  },
  {
    id: 'new-westminster',
    name: 'New Westminster',
    description: 'Complete coverage of New Westminster including Uptown, Downtown, Sapperton, and Queensborough.',
    popular: false,
    sameDay: true,
    coordinates: [49.2057, -122.9110],
  },
  {
    id: 'north-vancouver',
    name: 'North Vancouver',
    description: 'Serving both the City and District of North Vancouver, including Lynn Valley, Lonsdale, and Deep Cove areas.',
    popular: true,
    sameDay: true,
    coordinates: [49.3200, -123.0724],
  },
  {
    id: 'west-vancouver',
    name: 'West Vancouver',
    description: 'Service available throughout West Vancouver including Ambleside, Dundarave, and British Properties.',
    popular: false,
    sameDay: true,
    coordinates: [49.3387, -123.1683],
  },
  {
    id: 'delta',
    name: 'Delta',
    description: 'Covering North Delta, Ladner, and Tsawwassen communities with scheduled repair services.',
    popular: false,
    sameDay: false,
    coordinates: [49.0847, -123.0586],
  },
  {
    id: 'langley',
    name: 'Langley',
    description: 'Serving both Langley City and Township areas, including Willowbrook, Walnut Grove, and Aldergrove.',
    popular: false,
    sameDay: false,
    coordinates: [49.1044, -122.6631],
  },
  {
    id: 'white-rock',
    name: 'White Rock',
    description: 'Doorstep repair service available throughout the White Rock area, including the beachfront and uptown areas.',
    popular: false,
    sameDay: false,
    coordinates: [49.0253, -122.8029],
  },
  {
    id: 'maple-ridge',
    name: 'Maple Ridge',
    description: 'Service available in the Maple Ridge area with scheduled appointments.',
    popular: false,
    sameDay: false,
    coordinates: [49.2193, -122.5984],
  },
  {
    id: 'pitt-meadows',
    name: 'Pitt Meadows',
    description: 'Covering the Pitt Meadows area with our convenient doorstep repair service.',
    popular: false,
    sameDay: false,
    coordinates: [49.2307, -122.6892],
  },
  // New locations
  {
    id: 'abbotsford',
    name: 'Abbotsford',
    description: 'Providing device repair services throughout Abbotsford including downtown, University area, and Clearbrook with scheduled appointments.',
    popular: false,
    sameDay: false,
    coordinates: [49.0504, -122.3045],
  },
  {
    id: 'chilliwack',
    name: 'Chilliwack',
    description: 'Extending our services to Chilliwack and surrounding areas with pre-scheduled visits for your device repair needs.',
    popular: false,
    sameDay: false,
    coordinates: [49.1579, -121.9510],
  },
  {
    id: 'squamish',
    name: 'Squamish',
    description: 'Bringing our mobile repair expertise to Squamish with regularly scheduled service days each week.',
    popular: false,
    sameDay: false,
    coordinates: [49.7016, -123.1558],
  },
  {
    id: 'whistler',
    name: 'Whistler',
    description: 'Offering device repair services in Whistler including the Village and surrounding areas with scheduled appointments.',
    popular: false,
    sameDay: false,
    coordinates: [50.1163, -122.9574],
  },
  {
    id: 'mission',
    name: 'Mission',
    description: 'Providing device repair services to Mission residents with convenient scheduled appointments.',
    popular: false,
    sameDay: false,
    coordinates: [49.1336, -122.3095],
  }
];

// Create a placeholder component for server-side rendering
const MapPlaceholder = ({ isLoading, error }: DynamicOptionsLoadingProps) => (
  <div 
    style={{ height: "500px" }} 
    className="bg-gray-200 rounded-lg flex items-center justify-center"
  >
    <div className="text-gray-500">
      {isLoading ? "Loading map..." : error ? "Error loading map" : "Map component"}
    </div>
  </div>
);

// Dynamically import the Map component with SSR disabled
const MapWithNoSSR = dynamic(
  () => import('./MapComponent'), 
  { 
    ssr: false,
    loading: MapPlaceholder
  }
);

// Main component that uses the dynamic import
export default function InteractiveMap({ height = "500px", className = "" }: InteractiveMapProps) {
  return (
    <MapWithNoSSR 
      height={height} 
      className={className} 
      serviceAreas={enhancedServiceAreas} 
    />
  );
} 