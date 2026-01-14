import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// --- Regions ---
export function useRegions() {
  return useQuery({
    queryKey: [api.regions.list.path],
    queryFn: async () => {
      const res = await fetch(api.regions.list.path);
      if (!res.ok) throw new Error("Failed to fetch regions");
      return api.regions.list.responses[200].parse(await res.json());
    },
  });
}

// --- ADI Scores ---
export function useAdiScores(filters?: { state?: string; district?: string; pincode?: string }) {
  const queryKey = [api.adi.get.path, filters?.state, filters?.district, filters?.pincode];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(api.adi.get.path, window.location.href);
      if (filters?.state) url.searchParams.set("state", filters.state);
      if (filters?.district) url.searchParams.set("district", filters.district);
      if (filters?.pincode) url.searchParams.set("pincode", filters.pincode);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch ADI scores");
      return api.adi.get.responses[200].parse(await res.json());
    },
  });
}

// --- Timeline Data ---
export function useTimeline(filters: { state?: string; district?: string; pincode?: string }) {
  return useQuery({
    queryKey: [api.timeline.get.path, filters.state, filters.district, filters.pincode],
    queryFn: async () => {
      const url = new URL(api.timeline.get.path, window.location.href);
      if (filters.state) url.searchParams.set("state", filters.state);
      if (filters.district) url.searchParams.set("district", filters.district);
      if (filters.pincode) url.searchParams.set("pincode", filters.pincode);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch timeline data");
      return api.timeline.get.responses[200].parse(await res.json());
    },
    enabled: Boolean(filters.state || filters.district || filters.pincode),
  });
}

// --- Patterns ---
export function usePatterns(type: "migration" | "transition" | "instability") {
  return useQuery({
    queryKey: [api.patterns.list.path, type],
    queryFn: async () => {
      const url = buildUrl(api.patterns.list.path, { type });
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${type} patterns`);
      return api.patterns.list.responses[200].parse(await res.json());
    },
  });
}
