import { useAdiScores } from "@/hooks/use-adi-data";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons if needed, though we use CircleMarkers mostly
// For production, you might need to fix default icon paths

export function AdiMap() {
  const { data: scores, isLoading } = useAdiScores();

  // Center of India roughly
  const center: [number, number] = [20.5937, 78.9629];
  const zoom = 5;

  if (isLoading) {
    return (
      <div className="w-full h-[500px] rounded-xl bg-muted/30 animate-pulse flex items-center justify-center border border-border">
        <div className="text-muted-foreground font-medium">Loading Map Data...</div>
      </div>
    );
  }

  // Helper to determine color based on ADI score
  // High score = High Drift = Red
  // Low score = Stable = Green
  const getColor = (score: number) => {
    if (score > 0.7) return "#ef4444"; // Red
    if (score > 0.4) return "#f97316"; // Orange
    return "#22c55e"; // Green
  };

  // Mock coordinates for demo since CSV data likely doesn't have lat/lng
  // In a real app, we'd join with a geojson or coordinate DB
  // Here we will generate pseudo-random coordinates near India center for visualization demo
  // based on string hash of state name
  
  const getPseudoCoords = (state: string, district: string): [number, number] => {
    // Simple hash to float
    const hash = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
      return h;
    };
    
    // Base coords (India center) + jitter based on hash
    const latBase = 22;
    const lngBase = 79;
    
    const latOffset = (hash(state + district) % 1000) / 100; // +/- 10 deg
    const lngOffset = (hash(district + state) % 1000) / 100; // +/- 10 deg
    
    return [latBase + (latOffset % 10), lngBase + (lngOffset % 10)];
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-md h-[600px] bg-white relative z-0">
       <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {scores?.map((item, idx) => {
          const coords = getPseudoCoords(item.state, item.district);
          return (
            <CircleMarker 
              key={idx}
              center={coords}
              radius={8 + (item.adiScore * 10)} // Size based on score
              pathOptions={{ 
                fillColor: getColor(item.adiScore), 
                color: getColor(item.adiScore), 
                weight: 1, 
                opacity: 0.8, 
                fillOpacity: 0.6 
              }}
            >
              <Popup className="font-sans">
                <div className="p-1">
                  <h3 className="font-bold text-sm mb-1">{item.district}, {item.state}</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ADI Score:</span>
                      <span className="font-bold">{item.adiScore.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enrolment Dev:</span>
                      <span>{item.enrolmentDev.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age Shift:</span>
                      <span>{item.ageShift.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                {item.district} (ADI: {item.adiScore.toFixed(2)})
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur border border-border p-4 rounded-lg shadow-lg z-[1000] text-xs">
        <h4 className="font-bold mb-2 text-foreground">Drift Intensity</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span>High Drift (&gt; 0.7)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
            <span>Moderate (0.4 - 0.7)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span>Stable (&lt; 0.4)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
