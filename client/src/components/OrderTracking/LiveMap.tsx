/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPinIcon } from 'lucide-react';
import { iconsForLeafpad } from '../../assets/assets';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// 1. Spostato MapUpdater ALL'ESTERNO per evitare re-render continui
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LiveMap({
  order,
  liveLocation,
}: {
  order: any;
  liveLocation?: any;
}) {
  if (!order) return null;

  // Icone Custom
  const truckIcon = new L.Icon({
    iconUrl: iconsForLeafpad.truck,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

  const destinationIcon = new L.Icon({
    iconUrl: iconsForLeafpad.destination,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Estrazione sicura delle coordinate di destinazione (gestisce più tipi di strutture DB)
  const destLat = order.shippingAddress?.lat ?? order.address?.lat;
  const destLng = order.shippingAddress?.lng ?? order.address?.lng;
  const hasDestination = Boolean(destLat && destLng);

  // Estrazione sicura della posizione live
  const hasLiveLocation = Boolean(liveLocation && liveLocation.lat !== 0 && liveLocation.lng !== 0);

  // Determina le coordinate centrali di partenza per la mappa
  const centerLat = hasLiveLocation ? liveLocation.lat : destLat;
  const centerLng = hasLiveLocation ? liveLocation.lng : destLng;

  return (
    <div
      className="rounded-2xl overflow-hidden border border-app-border mb-6"
      style={{ height: 250, width: '100%' }}
    >
      {centerLat && centerLng ? (
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Marker Corriere Live */}
          {hasLiveLocation && (
            <Marker position={[liveLocation.lat, liveLocation.lng]} icon={truckIcon}>
              <Popup>Delivery Partner</Popup>
            </Marker>
          )}

          {/* Marker Indirizzo di Destinazione */}
          {hasDestination && (
            <Marker position={[destLat, destLng]} icon={destinationIcon}>
              <Popup>Delivery Address</Popup>
            </Marker>
          )}

          {/* Centra automaticamente sul corriere se in movimento */}
          {hasLiveLocation && (
            <MapUpdater center={[liveLocation.lat, liveLocation.lng]} />
          )}
        </MapContainer>
      ) : (
        /* Fallback se non ci sono coordinate salvate */
        <div className="h-full bg-app-green/5 flex flex-col items-center justify-center p-4">
          <MapPinIcon className="w-8 h-8 text-app-green/40 mb-2" />
          <p className="text-sm text-app-green/50 font-medium text-center">
            Waiting for delivery location coordinates...
          </p>
        </div>
      )}
    </div>
  );
}