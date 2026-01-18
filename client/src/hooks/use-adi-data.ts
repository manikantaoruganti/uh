import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// --- Regions ---
export function useRegions() {
  return useQuery({
    queryKey: ["/api/regions"],
    queryFn: async () => {
      const res = await fetch("/api/regions");
      if (!res.ok) throw new Error("Failed to fetch regions");
      const data = await res.json();
      return data; // keep raw, UI already handles shape
    },
  });
}

// --- ADI Scores ---
export function useAdiScores(filters?: { state?: string; district?: string; pincode?: string }) {
  const queryKey = ["/api/adi", filters?.state, filters?.district, filters?.pincode];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL("/api/adi", window.location.href);
      if (filters?.state) url.searchParams.set("state", filters.state);
      if (filters?.district) url.searchParams.set("district", filters.district);
      if (filters?.pincode) url.searchParams.set("pincode", filters.pincode);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch ADI scores");
      const data = await res.json();
      return data;
    },
  });
}

// --- Timeline Data ---
export function useTimeline(filters: { state?: string; district?: string; pincode?: string }) {
  return useQuery({
    queryKey: ["/api/timeline", filters.state, filters.district, filters.pincode],
    queryFn: async () => {
      const url = new URL("/api/timeline", window.location.href);
      if (filters.state) url.searchParams.set("state", filters.state);
      if (filters.district) url.searchParams.set("district", filters.district);
      if (filters.pincode) url.searchParams.set("pincode", filters.pincode);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch timeline data");
      const data = await res.json();
      return data;
    },
    enabled: Boolean(filters.state || filters.district || filters.pincode),
  });
}

// --- Patterns ---
export function usePatterns(type: "migration" | "transition" | "instability") {
  return useQuery({
    queryKey: ["/api/patterns", type],
    queryFn: async () => {
      const url = `/api/patterns/${type}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${type} patterns`);
      const data = await res.json();
      return data;
    },
  });
}
