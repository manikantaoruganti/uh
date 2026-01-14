import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Activity, 
  TrendingUp, 
  FileText 
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const safeLocation = location || "/";

  const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/map", label: "India Map", icon: MapIcon },
    { href: "/region", label: "Region Profile", icon: FileText },
    { href: "/patterns", label: "Pattern Explorer", icon: Activity },
  ];

  const currentLabel =
    navItems.find(i => i.href === safeLocation)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-b md:border-r border-border shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <TrendingUp className="w-6 h-6 text-primary mr-2" />
          <span className="font-display font-bold text-xl tracking-tight">ADI System</span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = safeLocation === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <h4 className="font-bold text-sm mb-1">Live Monitor</h4>
            <p className="text-xs text-blue-100 opacity-80">
              System is currently processing incoming update requests.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold bg-white/20 rounded px-2 py-1 w-fit">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Online
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <header className="h-16 bg-white/50 backdrop-blur-sm border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="font-display font-semibold text-lg text-foreground">
            {currentLabel}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-muted-foreground font-medium px-3 py-1 bg-muted rounded-full border border-border">
              v1.0.0-beta
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
