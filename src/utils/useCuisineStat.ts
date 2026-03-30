// src/hooks/useCuisineStats.ts
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/SupabaseProvider";

export type CuisineStat = {
  cuisine: string;
  count: number;
};

export function useCuisineStats(eventId: string | null) {
  const supabase = useSupabase();

  return useQuery<CuisineStat[]>({
    queryKey: ["cuisine-stats", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      // ✅ TS-Narrowing
      if (!eventId) return [];

      const { data, error } = await supabase
        .from("food_preferences")
        .select("cuisine")
        .eq("event_id", eventId);

      if (error) throw error;

      const counts: Record<string, number> = {};

      for (const row of data ?? []) {
        const cuisine = (row as any).cuisine as string | null;
        if (!cuisine) continue;
        counts[cuisine] = (counts[cuisine] ?? 0) + 1;
      }

      return Object.entries(counts).map(([cuisine, count]) => ({
        cuisine,
        count,
      }));
    },
  });
}
