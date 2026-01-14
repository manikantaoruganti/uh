import { useState } from "react";
import { Layout } from "@/components/Layout";
import { usePatterns } from "@/hooks/use-adi-data";
import { cn } from "@/lib/utils";
import { 
  ArrowRightLeft, 
  Briefcase, 
  AlertOctagon,
  ChevronRight 
} from "lucide-react";

type PatternType = "migration" | "transition" | "instability";

export default function Patterns() {
  const [activeTab, setActiveTab] = useState<PatternType>("migration");
  const { data: patterns = [], isLoading } = usePatterns(activeTab); // safe default

  const tabs = [
    { id: "migration", label: "Migration", icon: ArrowRightLeft, desc: "Population movement between regions" },
    { id: "transition", label: "Demographic Transition", icon: Briefcase, desc: "Working age population shifts" },
    { id: "instability", label: "Instability", icon: AlertOctagon, desc: "Anomalous update bursts" },
  ] as const;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold">Pattern Explorer</h2>
          <p className="text-muted-foreground">AI-detected anomalies and sociological patterns.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-start p-6 rounded-xl border transition-all duration-200 text-left",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg ring-2 ring-primary/20 ring-offset-2"
                  : "bg-card hover:bg-muted border-border text-foreground hover:shadow-md"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg mb-4",
                activeTab === tab.id ? "bg-white/20" : "bg-primary/10 text-primary"
              )}>
                <tab.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">{tab.label}</h3>
              <p className={cn(
                "text-sm mt-1",
                activeTab === tab.id ? "text-blue-100" : "text-muted-foreground"
              )}>
                {tab.desc}
              </p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl">Detected Patterns</h3>
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {patterns.length} results found
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {patterns.map((pattern, idx) => (
                <div 
                  key={idx} 
                  className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {pattern.type}
                      </span>
                      <h4 className="font-bold text-lg">
                        {pattern.region.district}, {pattern.region.state}
                      </h4>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {pattern.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center mt-4 md:mt-0 gap-6">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground font-semibold uppercase">Confidence</div>
                      <div className={cn(
                        "text-xl font-bold font-mono",
                        pattern.confidence > 0.8 ? "text-green-600" : "text-orange-500"
                      )}>
                        {(pattern.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors group-hover:border-primary">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              {patterns.length === 0 && (
                <div className="text-center py-12 border border-dashed border-border rounded-xl bg-muted/10">
                  <p className="text-muted-foreground">No significant patterns of this type detected currently.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
