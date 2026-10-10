'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ngoIcon = L.divIcon({
  html: `<div style="background: #a855f7; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">🤝</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: ''
});

const userIcon = L.divIcon({
  html: `<div style="background: #6366f1; color: white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 2px 12px rgba(99,102,241,0.6);">👤</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  className: ''
});

const issueIcon = L.divIcon({
  html: `<div style="background: #f59e0b; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: ''
});

function MapCenter({ userLocation }: { userLocation: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) map.flyTo(userLocation, 13, { animate: true, duration: 1.5 });
  }, [userLocation, map]);
  return null;
}

interface MapComponentProps {
  ngos?: any[];
  issues?: any[];
  userLocation?: [number, number] | null;
  onNGOSelect?: (ngo: any) => void;
}

export default function MapComponent({ ngos = [], issues = [], userLocation, onNGOSelect }: MapComponentProps) {
  const defaultCenter: [number, number] = userLocation || [20.5937, 78.9629];
  const defaultZoom = userLocation ? 13 : 5;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: 520, width: '100%', background: '#1a1d26' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <MapCenter userLocation={userLocation || null} />
      {userLocation && (
        <>
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 120 }}>
                <strong>📍 Your Location</strong>
              </div>
            </Popup>
          </Marker>
          <Circle center={userLocation} radius={5000} fillColor="#6366f1" fillOpacity={0.08} color="#6366f1" opacity={0.3} />
        </>
      )}
      {ngos.filter(n => n.location?.coordinates).map(ngo => (
        <Marker key={ngo._id} position={[ngo.location.coordinates[1], ngo.location.coordinates[0]]} icon={ngoIcon} eventHandlers={{ click: () => onNGOSelect?.(ngo) }}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 180 }}>
              <strong style={{ fontSize: 14 }}>{ngo.organizationName || ngo.name}</strong>
              {ngo.phone && <p style={{ margin: '4px 0', fontSize: 12 }}>📞 {ngo.phone}</p>}
              {ngo.categories?.length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {ngo.categories.map((c: string) => (
                    <span key={c} style={{ fontSize: 10, background: '#e9d5ff', color: '#7c3aed', borderRadius: 4, padding: '2px 6px' }}>{c}</span>
                  ))}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
      {issues.filter(i => i.location?.coordinates).map(issue => (
        <Marker key={issue._id} position={[issue.location.coordinates[1], issue.location.coordinates[0]]} icon={issueIcon}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 180 }}>
              <strong style={{ fontSize: 13 }}>{issue.title}</strong>
              <p style={{ margin: '4px 0', fontSize: 12, color: '#666' }}>{issue.category} · {issue.status}</p>
              <p style={{ margin: '4px 0', fontSize: 12 }}>▲ {issue.upvotes} upvotes</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
