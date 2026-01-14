import { Layout } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { AdiMap } from "@/components/AdiMap";
import { Link } from "wouter";
import { 
  Users, 
  Activity, 
  MapPin, 
  AlertTriangle, 
  ArrowRight,
  Database
} from "lucide-react";
import { useAdiScores } from "@/hooks/use-adi-data";

export default function Home() {
  const { data: scores = [] } = useAdiScores(); // safe default

  const totalRegions = scores.length;
  const highRiskRegions = scores.filter(s => s.adiScore > 0.7).length;
  const avgAdi = scores.length > 0 
    ? scores.reduce((acc, curr) => acc + curr.adiScore, 0) / scores.length 
    : 0;

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight">
            Detecting <span className="text-primary">Hidden Population Stress</span> Through Update Behavior
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            The Aadhaar Drift Index (ADI) analyzes millions of update transactions to identify migration patterns, 
            demographic shifts, and regional instability before traditional census data catches up.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/map">
              <button className="px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center group">
                Explore Heatmap
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/patterns">
              <button className="px-6 py-3 rounded-xl font-semibold bg-white border border-border text-foreground shadow-sm hover:bg-gray-50 transition-all">
                View Patterns
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MetricCard title="Total Regions" value={totalRegions} icon={<MapPin className="w-6 h-6" />} />
          <MetricCard 
            title="Avg. ADI Score" 
            value={avgAdi.toFixed(2)} 
            trend={avgAdi > 0.5 ? 12 : -5}
            icon={<Activity className="w-6 h-6" />} 
          />
          <MetricCard 
            title="High Drift Zones" 
            value={highRiskRegions} 
            variant="secondary"
            description="Regions requiring attention"
            icon={<AlertTriangle className="w-6 h-6" />} 
          />
          <MetricCard 
            title="Data Points" 
            value="1.2M+" 
            icon={<Database className="w-6 h-6" />}
            description="From processed CSVs"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">National Overview</h2>
          <Link href="/map" className="text-primary text-sm font-semibold hover:underline">
            View Full Map →
          </Link>
        </div>
        <AdiMap />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg mb-2">Demographic Shifts</h3>
          <p className="text-sm text-muted-foreground">
            Track unusual changes in age distributions and gender ratios that signal workforce migration.
          </p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg mb-2">Biometric Updates</h3>
          <p className="text-sm text-muted-foreground">
            Monitor surges in mandatory biometric updates which often correlate with service access demands.
          </p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg mb-2">Instability Detection</h3>
          <p className="text-sm text-muted-foreground">
            Early warning system for regions showing rapid decoupling between enrolment and update rates.
          </p>
        </div>
      </div>
    </Layout>
  );
}
