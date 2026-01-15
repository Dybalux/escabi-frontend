import { useEffect, useRef } from 'react';

export default function CoverageMap({ center = [-26.69, -66.05], radius = 2000 }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Limpiar mapa si ya existe
        if (mapInstance.current) {
            mapInstance.current.remove();
        }

        // Inicializar Leaflet
        const L = window.L;
        if (!L) return;

        mapInstance.current = L.map(mapRef.current).setView(center, 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        // Zona Céntrica (Círculo)
        L.circle(center, {
            color: '#28a745',
            fillColor: '#28a745',
            fillOpacity: 0.2,
            radius: radius
        }).addTo(mapInstance.current)
            .bindPopup('🎁 <strong>Zona de Envío Gratis</strong><br/>Centro de Santa María');

        // Marcador del local (opcional)
        L.marker(center).addTo(mapInstance.current)
            .bindPopup('🏪 <strong>Nuestro Local</strong>');

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [center, radius]);

    return (
        <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
            <div ref={mapRef} className="w-full h-full" style={{ minHeight: '180px' }} />
        </div>
    );
}
