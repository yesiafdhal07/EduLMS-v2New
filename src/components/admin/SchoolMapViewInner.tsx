'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { School as SchoolIcon, Users, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface SchoolData {
    id: string;
    name: string;
    address?: string;
    guru_count: number;
    siswa_count: number;
    is_active: boolean;
}

interface Props {
    schools: SchoolData[];
}

// Generate deterministic coordinates based on school ID
const generateCoordinates = (id: string) => {
    // Check local storage first (simulating database save)
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`school-location-${id}`);
        if (saved) {
            try { return JSON.parse(saved) as [number, number]; } catch (e) {}
        }
    }
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = -6.200000 + (hash % 1000) / 5000;
    const lng = 106.816666 + ((hash >> 4) % 1000) / 5000;
    return [lat, lng] as [number, number];
};

const createCustomIcon = (isActive: boolean) => {
    const iconHtml = renderToStaticMarkup(
        <div className={`w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center ${isActive ? 'bg-[#0F1014] border-emerald-500' : 'bg-[#0F1014] border-rose-500 opacity-70'}`}>
            <MapPin size={16} className={isActive ? 'text-emerald-400' : 'text-rose-400'} />
        </div>
    );
    
    return L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

export default function SchoolMapViewInner({ schools }: Props) {
    useEffect(() => {
        // Fix for default Leaflet icons in Webpack/Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    // Jakarta coordinates
    const center: [number, number] = [-6.200000, 106.816666];

    return (
        <MapContainer 
            center={center} 
            zoom={11} 
            scrollWheelZoom={false}
            className="w-full h-full rounded-2xl z-0"
            style={{ background: '#0F1014' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {schools.map(school => {
                const pos = generateCoordinates(school.id);
                return (
                    <Marker 
                        key={school.id} 
                        position={pos}
                        icon={createCustomIcon(school.is_active)}
                        draggable={true}
                        eventHandlers={{
                            dragend: (e) => {
                                const marker = e.target;
                                const position = marker.getLatLng();
                                localStorage.setItem(`school-location-${school.id}`, JSON.stringify([position.lat, position.lng]));
                                // We could show a toast here, but we don't want to import it deeply, just log it.
                                console.log('Location saved locally:', position);
                            }
                        }}
                    >
                        <Popup className="school-map-popup">
                            <div className="p-1">
                                <h3 className="font-bold text-sm mb-1">{school.name}</h3>
                                <p className="text-xs text-emerald-400 mb-2 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded font-bold inline-block">
                                    Geser pin untuk atur lokasi
                                </p>
                                <p className="text-xs text-gray-500 mb-3">{school.address || 'Alamat tidak diketahui'}</p>
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Guru</span>
                                        <span className="font-bold text-indigo-600">{school.guru_count}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Siswa</span>
                                        <span className="font-bold text-emerald-600">{school.siswa_count}</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
