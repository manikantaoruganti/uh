import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "secondary";
}

export function MetricCard({ 
  title, 
  value, 
  trend, 
  description, 
  icon,
  variant = "default" 
}: MetricCardProps) {
  const hasTrend = typeof trend === "number";
  const isPositive = hasTrend && trend > 0;
  const isNeutral = hasTrend && trend === 0;
  const isNegative = hasTrend && trend < 0;

  return (
    <div className={cn(
      "dashboard-card p-6 relative overflow-hidden",
      variant === "primary" && "bg-primary text-primary-foreground border-primary",
      variant === "secondary" && "bg-secondary text-secondary-foreground border-secondary"
    )}>
      {variant !== "default" && icon && (
        <div className="absolute -right-4 -top-4 opacity-10 scale-150 transform rotate-12">
          {icon}
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-2 rounded-lg",
          variant === "default" ? "bg-primary/10 text-primary" : "bg-white/20 text-white"
        )}>
          {icon}
        </div>

        {hasTrend && (
          <div className={cn(
            "flex items-center text-sm font-medium px-2 py-1 rounded-full",
            isPositive
              ? "text-green-600 bg-green-50"
              : isNeutral
              ? "text-gray-600 bg-gray-50"
              : "text-red-600 bg-red-50",
            variant !== "default" && "bg-white/20 text-white"
          )}>
            {isPositive && <ArrowUpRight className="w-4 h-4 mr-1" />}
            {isNeutral && <Minus className="w-4 h-4 mr-1" />}
            {isNegative && <ArrowDownRight className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <h3 className={cn(
          "text-sm font-medium mb-1",
          variant === "default" ? "text-muted-foreground" : "text-white/80"
        )}>
          {title}
        </h3>
        <div className="text-3xl font-display font-bold tracking-tight">
          {value}
        </div>
        {description && (
          <p className={cn(
            "text-xs mt-2",
            variant === "default" ? "text-muted-foreground" : "text-white/60"
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
