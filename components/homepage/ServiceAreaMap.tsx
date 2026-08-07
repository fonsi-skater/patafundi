"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { serviceAreas } from "@/lib/mock-data";
import "leaflet/dist/leaflet.css";

export default function ServiceAreaMap() {
  return (
    <section className="section bg-offwhite">
      <h2 className="text-2xl md:text-3xl font-bold text-ink text-center mb-3">
        We're growing across Kenya
      </h2>
      <p className="text-ink/60 text-center max-w-lg mx-auto mb-4">
        Verified fundis are already live in these areas. Don't see yours? We're
        adding new areas every month.
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {serviceAreas.map((area) => (
          <span
            key={area.name}
            className="text-xs bg-navy text-white rounded-full px-3 py-1.5"
          >
            {area.name}
          </span>
        ))}
      </div>

      <div className="rounded-card overflow-hidden border border-ink/10 h-[350px]">
        <MapContainer
          center={[-1.2, 36.85]}
          zoom={10}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {serviceAreas.map((area) => (
            <Marker key={area.name} position={[area.lat, area.lng]}>
              <Popup>{area.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
