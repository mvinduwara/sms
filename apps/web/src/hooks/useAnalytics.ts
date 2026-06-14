import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AnalyticsData, StatsOverview } from "@/types";

export function useAnalytics(days: number = 14) {
  return useQuery({
    queryKey: ["analytics", days],
    queryFn: async () => {
      const { data } = await api.get<AnalyticsData>("/analytics", {
        params: { days },
      });
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data } = await api.get<StatsOverview>("/analytics/stats");
      return data;
    },
    refetchInterval: 15000,
  });
}