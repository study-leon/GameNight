// src/hooks/useFoodPreference.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";


type FoodPreferenceRow = {
  id: string;
  event_id: string;
  user_id: string;
  cuisine: string;
  created_at: string;
};

export function useFoodPreference(eventId: string | null) {
  const supabase = useSupabase();
  const { user } = useUser();
  const userId = user?.id ?? null;

  const {
    data: preference,
    refetch,
  } = useQuery<FoodPreferenceRow | null>({
    queryKey: ["food-preference", eventId, userId],
    enabled: !!eventId && !!userId,
    queryFn: async () => {
      // ✅ hier schärfen wir die Types
      if (!eventId || !userId) return null;

      const { data, error } = await supabase
        .from("food_preferences")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data; // null oder Row
    },
  });

  const savePreference = useMutation({
    mutationFn: async (cuisine: string) => {
      if (!eventId || !userId) {
        throw new Error("eventId oder userId fehlt");
      }

      const payload = {
        event_id: eventId,
        user_id: userId,
        cuisine,
      };

      // 💡 Typen für food_preferences sind bei dir offenbar
      // noch nicht im generated Database-Type – deshalb `as any`
      const { data, error } = await supabase
        .from("food_preferences")
        .upsert(payload as any, {
          onConflict: "event_id,user_id",
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  return { preference, savePreference };
}