'use client';

import dynamic from 'next/dynamic';
import { Spinner, ErrorBoundary } from '@/components/ui';

// Dynamically import Leaflet components to avoid SSR window is not defined errors
const MapInner = dynamic(() => import('./SchoolMapViewInner'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F1014] border border-white/5 rounded-2xl">
            <Spinner />
            <p className="mt-4 text-sm font-bold text-slate-400 animate-pulse">Memuat Peta Geografis...</p>
        </div>
    )
});

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

export function SchoolMapView({ schools }: Props) {
    return (
        <div className="w-full h-[500px] relative rounded-2xl overflow-hidden border border-white/5 bg-[#0F1014]">
            {/* CSS override for Leaflet dark mode popup */}
            <style jsx global>{`
                .school-map-popup .leaflet-popup-content-wrapper {
                    background: #181A20;
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
                }
                .school-map-popup .leaflet-popup-tip {
                    background: #181A20;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                }
            `}</style>
            <ErrorBoundary>
                <MapInner schools={schools} />
            </ErrorBoundary>
            
            {/* Ambient Overlay */}
            <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none z-[400]" />
        </div>
    );
}
