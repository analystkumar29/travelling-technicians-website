import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Interface for the area data
interface AreaData {
  id: string;
  name: string;
  description: string;
  popular: boolean;
  sameDay: boolean;
  image?: string;
  coordinates: [number, number]; // [latitude, longitude]
}

// Props for the map component
interface MapComponentProps {
  height: string;
  className: string;
  serviceAreas: AreaData[];
}

// Custom marker icon for the map
const customIcon = (popular: boolean) => 
  L.icon({
    iconUrl: popular 
      ? '/images/icons/marker-icon-primary.png' 
      : '/images/icons/marker-icon-gray.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: '/images/icons/marker-shadow.png',
    shadowSize: [41, 41],
  });

// Function to fit map bounds based on markers (used inside child component)
const MapController = ({ serviceAreas }: { serviceAreas: AreaData[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (serviceAreas.length > 0) {
      const bounds = L.latLngBounds(serviceAreas.map(area => area.coordinates));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, serviceAreas]);
  
  return null;
};

const MapComponent = ({ height, className, serviceAreas }: MapComponentProps) => {
  // Fix Leaflet icons on component mount
  useEffect(() => {
    // Fix the marker icon paths in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/icons/marker-icon-2x.png',
      iconUrl: '/images/icons/marker-icon.png',
      shadowUrl: '/images/icons/marker-shadow.png',
    });
  }, []);

  return (
    <div style={{ height: height }} className={className}>
      <MapContainer
        center={[49.2827, -123.1207]} // Center on Vancouver by default
        zoom={9}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        zoomControl={false} // We'll add it in a different position
      >
        <MapController serviceAreas={serviceAreas} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        
        {serviceAreas.map((area) => (
          <Marker 
            key={area.id} 
            position={area.coordinates}
            icon={customIcon(area.popular)}
          >
            <Popup className="service-area-popup">
              <div className="pb-1">
                <h3 className="font-bold text-lg">{area.name}</h3>
                <p className="text-sm mt-1 mb-2">{area.description}</p>
                <div className="text-sm font-medium">
                  {area.sameDay ? (
                    <span className="text-green-600">Same-day service available</span>
                  ) : (
                    <span className="text-gray-600">Scheduled service available</span>
                  )}
                </div>
                <div className="mt-3">
                  <a
                    href="/book-online"
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Book a repair in {area.name} →
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent; 