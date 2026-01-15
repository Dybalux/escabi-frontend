import React, { useEffect, useRef } from 'react';

const InteractiveShippingMap = ({ onZoneSelect, selectedZone, shippingPrices, readOnly = false }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const zonesRef = useRef({});

    useEffect(() => {
        // Coordenadas de tu local (Santa María, Catamarca)
        const localCoord = [-26.70333, -66.05377];

        // Obtener precios de la configuración o usar valores por defecto
        const centralPrice = shippingPrices?.central?.price ?? 0;
        const remotePrice = shippingPrices?.remote?.price ?? 1000;

        // DEFINICIÓN DE ZONAS (Coordenadas reales procesadas)
        const zones = {
            central: {
                name: "Zona Céntrica",
                price: centralPrice,
                color: '#28a745', // Verde
                coordinates: [
                    [-26.70640, -66.05847], [-26.70995, -66.04866], [-26.71072, -66.04745],
                    [-26.70541, -66.04538], [-26.70595, -66.04272], [-26.69373, -66.03844],
                    [-26.69053, -66.04183], [-26.68763, -66.04250], [-26.68607, -66.04319],
                    [-26.68478, -66.04533], [-26.68407, -66.05086], [-26.70656, -66.05780]
                ]
            },
            este: {
                name: "Zona Este",
                price: remotePrice,
                color: '#17a2b8', // Cian
                coordinates: [
                    [-26.70233, -66.04142], [-26.70591, -66.04276], [-26.70539, -66.04538],
                    [-26.71079, -66.04734], [-26.71377, -66.04307], [-26.71473, -66.03102],
                    [-26.70754, -66.03093], [-26.70777, -66.04027], [-26.70638, -66.04036],
                    [-26.70368, -66.03804], [-26.70233, -66.04142]
                ]
            },
            oeste: {
                name: "Zona Oeste",
                price: remotePrice,
                color: '#fd7e14', // Naranja
                coordinates: [
                    [-26.69094, -66.05299], [-26.68706, -66.06435], [-26.68614, -66.07079],
                    [-26.69213, -66.07215], [-26.69852, -66.06764], [-26.70105, -66.05616],
                    [-26.69094, -66.05299]
                ]
            },
            sur: {
                name: "Zona Sur",
                price: remotePrice,
                color: '#6f42c1', // Púrpura
                coordinates: [
                    [-26.70658, -66.05785], [-26.71119, -66.06078], [-26.72275, -66.05823],
                    [-26.72561, -66.04416], [-26.71374, -66.04323], [-26.70986, -66.04878],
                    [-26.70658, -66.05785]
                ]
            },
            norte: {
                name: "Zona Norte",
                price: remotePrice,
                color: '#ffc107', // Amarillo
                coordinates: [
                    [-26.68404, -66.04905], [-26.68469, -66.04557], [-26.68332, -66.03627],
                    [-26.68091, -66.03434], [-26.68184, -66.03051], [-26.68037, -66.02891],
                    [-26.67803, -66.03051], [-26.67116, -66.02749], [-26.66658, -66.03474],
                    [-26.67405, -66.03675], [-26.68024, -66.04848], [-26.68404, -66.04905]
                ]
            }
        };

        if (!mapInstance.current && window.L) {
            mapInstance.current = window.L.map(mapRef.current).setView(localCoord, 13);

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapInstance.current);

            // Icono de la Tienda
            const shopIcon = window.L.divIcon({
                html: `<div style="font-size: 26px;">🏪</div>`,
                className: 'shop-marker',
                iconSize: [30, 30]
            });

            window.L.marker(localCoord, { icon: shopIcon })
                .addTo(mapInstance.current)
                .bindPopup('<b>Nuestro Local</b><br>Punto de Retiro GRATIS');

            // Dibujar Polígonos
            Object.entries(zones).forEach(([key, zone]) => {
                const polygon = window.L.polygon(zone.coordinates, {
                    color: zone.color,
                    fillColor: zone.color,
                    fillOpacity: 0.3,
                    weight: 2
                }).addTo(mapInstance.current);

                // Click en zona -> Notificar al padre (solo si no es readOnly)
                if (!readOnly) {
                    polygon.on('click', () => {
                        if (onZoneSelect) {
                            // Mapear zonas visuales a zonas del backend
                            const mappedZone = ['este', 'oeste', 'norte', 'sur'].includes(key) ? 'remote' : key;
                            onZoneSelect(mappedZone);
                        }
                    });
                }

                // Popup descriptivo
                polygon.bindPopup(`
          <div style="text-align: center; font-family: sans-serif;">
            <strong style="font-size: 16px;">${zone.name}</strong><br/>
            <span style="color: ${zone.price === 0 ? 'green' : '#333'}; font-weight: bold;">
              ${zone.price === 0 ? '🎁 Envío GRATIS' : `Costo de envío: $${zone.price}`}
            </span><br/>
            <button 
              onclick="window.selectZone('${key}')"
              style="margin-top: 8px; cursor: pointer; background: ${zone.color}; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-weight: bold;"
            >
              Seleccionar Zona
            </button>
          </div>
        `);

                // Etiqueta de nombre
                window.L.marker(polygon.getBounds().getCenter(), {
                    icon: window.L.divIcon({
                        className: 'zone-label',
                        html: `<span style="background: white; padding: 6px 12px; border-radius: 6px; border: 2px solid ${zone.color}; font-size: 14px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.2); color: ${zone.color};">${zone.name}</span>`,
                        iconSize: [100, 30]
                    })
                }).addTo(mapInstance.current);

                zonesRef.current[key] = polygon;
            });

            window.selectZone = (key) => {
                if (onZoneSelect) {
                    // Mapear zonas visuales a zonas del backend
                    const mappedZone = ['este', 'oeste', 'norte', 'sur'].includes(key) ? 'remote' : key;
                    onZoneSelect(mappedZone);
                }
            };
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
            delete window.selectZone;
        };
    }, [onZoneSelect]);

    // Sincronizar UI con selección
    useEffect(() => {
        Object.entries(zonesRef.current).forEach(([key, poly]) => {
            poly.setStyle({
                fillOpacity: key === selectedZone ? 0.6 : 0.3,
                weight: key === selectedZone ? 4 : 2
            });
            if (key === selectedZone) {
                poly.openPopup();
            }
        });
    }, [selectedZone]);

    return (
        <div className="shipping-map-wrapper">
            <h3 className="section-title">📍 Encuentra tu zona de entrega</h3>
            <div
                ref={mapRef}
                className="map-element"
            />

            {/* Información de la zona seleccionada (solo si no es readOnly) */}
            {selectedZone && !readOnly && (
                <div className="selected-zone-info">
                    {selectedZone === 'central' && (
                        <div className="zone-badge" style={{ borderColor: '#28a745', backgroundColor: '#28a74510' }}>
                            <span className="zone-color" style={{ backgroundColor: '#28a745' }}></span>
                            <strong>Zona Céntrica:</strong> {shippingPrices?.central?.price === 0 ? 'Envío GRATIS 🎁' : `$${shippingPrices?.central?.price ?? 0} 🚚`}
                        </div>
                    )}
                    {selectedZone === 'este' && (
                        <div className="zone-badge" style={{ borderColor: '#17a2b8', backgroundColor: '#17a2b810' }}>
                            <span className="zone-color" style={{ backgroundColor: '#17a2b8' }}></span>
                            <strong>Zona Este:</strong> {(shippingPrices?.remote?.price ?? 1000) === 0 ? 'Envío GRATIS 🎁' : `$${shippingPrices?.remote?.price ?? 1000} 🚚`}
                        </div>
                    )}
                    {selectedZone === 'oeste' && (
                        <div className="zone-badge" style={{ borderColor: '#fd7e14', backgroundColor: '#fd7e1410' }}>
                            <span className="zone-color" style={{ backgroundColor: '#fd7e14' }}></span>
                            <strong>Zona Oeste:</strong> {(shippingPrices?.remote?.price ?? 1000) === 0 ? 'Envío GRATIS 🎁' : `$${shippingPrices?.remote?.price ?? 1000} 🚚`}
                        </div>
                    )}
                    {selectedZone === 'sur' && (
                        <div className="zone-badge" style={{ borderColor: '#6f42c1', backgroundColor: '#6f42c110' }}>
                            <span className="zone-color" style={{ backgroundColor: '#6f42c1' }}></span>
                            <strong>Zona Sur:</strong> {(shippingPrices?.remote?.price ?? 1000) === 0 ? 'Envío GRATIS 🎁' : `$${shippingPrices?.remote?.price ?? 1000} 🚚`}
                        </div>
                    )}
                    {selectedZone === 'norte' && (
                        <div className="zone-badge" style={{ borderColor: '#ffc107', backgroundColor: '#ffc10710' }}>
                            <span className="zone-color" style={{ backgroundColor: '#ffc107' }}></span>
                            <strong>Zona Norte:</strong> {(shippingPrices?.remote?.price ?? 1000) === 0 ? 'Envío GRATIS 🎁' : `$${shippingPrices?.remote?.price ?? 1000} 🚚`}
                        </div>
                    )}
                </div>
            )}

            <style>{`
        .shipping-map-wrapper { margin: 25px 0; }
        .shipping-map-wrapper .section-title { margin-bottom: 15px; font-size: 1.3rem; color: #2d3436; }
        .shipping-map-wrapper .map-element { height: 500px; width: 100%; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .shipping-map-wrapper .selected-zone-info { 
            margin-top: 20px; 
            display: flex;
            justify-content: center;
        }
        .shipping-map-wrapper .zone-badge { 
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: white; 
            padding: 16px 24px; 
            border-radius: 12px; 
            font-size: 16px; 
            border: 2px solid;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
        }
        .shipping-map-wrapper .zone-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.12);
        }
        .shipping-map-wrapper .zone-color {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
        }
      `}</style>
        </div>
    );
};

export default InteractiveShippingMap;
