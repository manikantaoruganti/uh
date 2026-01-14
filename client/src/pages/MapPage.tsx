import { Layout } from "@/components/Layout";
import { AdiMap } from "@/components/AdiMap";

export default function MapPage() {
  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-64px)]"> {/* header height */}
        <div className="mb-6">
          <h2 className="text-3xl font-display font-bold">Geospatial Drift Analysis</h2>
          <p className="text-muted-foreground">
            Visualizing Aadhaar update anomalies across districts. Red indicates high divergence from expected baseline.
          </p>
        </div>
        
        <div className="flex-1 min-h-0">
          <AdiMap />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Methodology</div>
            <p className="text-sm">
              Scores calculated using weighted variance of enrolment, demographic updates, and biometric refreshes.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Update Frequency</div>
            <p className="text-sm">Data aggregated monthly. Last refresh: 2 hours ago.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
