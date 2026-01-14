import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useRegions, useAdiScores, useTimeline } from "@/hooks/use-adi-data";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";
import { MetricCard } from "@/components/MetricCard";
import { Filter, Search } from "lucide-react";

export default function RegionProfile() {
  const { data: regions = [] } = useRegions(); // safe default
  
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const states = Array.from(new Set(regions.map(r => r.state))).sort();
  const districts = selectedState
    ? Array.from(new Set(regions.filter(r => r.state === selectedState).map(r => r.district))).sort()
    : [];

  const { data: adiData = [] } = useAdiScores({ 
    state: selectedState, 
    district: selectedDistrict 
  });

  const { data: timelineData = [] } = useTimeline({
    state: selectedState,
    district: selectedDistrict
  });

  // FIX: match backend metric names
  const enrolmentSeries = timelineData.filter(d => d.metric === "Enrolment");
  const updateSeries = timelineData.filter(d => d.metric === "Demographic");

  const currentScore = adiData[0];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold">Region Profile</h2>
          <p className="text-muted-foreground">Deep dive into district-level demographic kinetics.</p>
        </div>

        {/* Filters */}
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="flex items-center text-muted-foreground mr-2">
            <Filter className="w-5 h-5 mr-2" />
            <span className="font-medium">Filters:</span>
          </div>
          
          <div className="w-full md:w-64">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">State</label>
            <select 
              className="w-full p-2 rounded-lg border border-border bg-background"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict("");
              }}
            >
              <option value="">Select State...</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="w-full md:w-64">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">District</label>
            <select 
              className="w-full p-2 rounded-lg border border-border bg-background disabled:opacity-50"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedState}
            >
              <option value="">Select District...</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Analyze Region
          </button>
        </div>

        {selectedDistrict ? (
          <>
            {/* KPIs */}
            {currentScore ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="ADI Score" value={currentScore.adiScore.toFixed(2)} />
                <MetricCard title="Enrolment Deviation" value={currentScore.enrolmentDev.toFixed(2)} />
                <MetricCard title="Demographic Flux" value={currentScore.demographicDev.toFixed(2)} />
                <MetricCard title="Age Shift" value={currentScore.ageShift.toFixed(2)} />
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
                No specific scoring data available for this district.
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-xl border shadow-sm">
                <h3 className="font-bold text-lg mb-6">Enrolment Trend</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={enrolmentSeries}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border shadow-sm">
                <h3 className="font-bold text-lg mb-6">Demographic Updates</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={updateSeries}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#f97316" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-xl border border-dashed">
            <Search className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">Select a district to view analysis</h3>
          </div>
        )}
      </div>
    </Layout>
  );
}
