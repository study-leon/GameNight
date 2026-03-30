// src/hooks/useRestaurantLikes.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { Alert } from "react-native";

export type RestaurantLikesData = {
  likedByUser: Set<string>;              // place_ids, die dieser User geliked hat
  counts: Record<string, number>;        // place_id -> Anzahl Likes
};

export function useRestaurantLikes(placeIds: string[]) {
  const supabase = useSupabase();
  const { user } = useUser();
  const userId = user?.id ?? null;

  // Likes + Counts laden
  const {
    data,
    isLoading,
    refetch,
  } = useQuery<RestaurantLikesData>({
    queryKey: ["restaurant-likes", placeIds, userId],
    enabled: placeIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_likes")
        .select("place_id, user_id")
        .in("place_id", placeIds as any); // TS-Hack, Typen noch nicht generiert

      if (error) throw error;

      const likedByUser = new Set<string>();
      const counts: Record<string, number> = {};

      for (const row of data ?? []) {
        const pid = (row as any).place_id as string;
        const uid = (row as any).user_id as string;

        counts[pid] = (counts[pid] ?? 0) + 1;
        if (userId && uid === userId) {
          likedByUser.add(pid);
        }
      }

      return { likedByUser, counts };
    },
  });

  // Like hinzufügen
  const likeMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!userId) throw new Error("Kein User eingeloggt");

      const { error } = await supabase
        .from("restaurant_likes")
        .insert(
          {
            place_id: placeId,
            user_id: userId,
          } as any,
        );

      if (error && error.code !== "23505") {
        // 23505 = unique violation (bereits geliked) → ignoren
        throw error;
      }
    },
    onSuccess: () => {
      refetch();
      },
      onError: (error) => {
          Alert.alert("Fehler", "Like konnte nicht gespeichert werden.");
          console.error("Like error:", error);
    }
  });

  // Like entfernen
  const unlikeMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!userId) throw new Error("Kein User eingeloggt");

      const { error } = await supabase
        .from("restaurant_likes")
        .delete()
        .eq("place_id", placeId)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const toggleLike = (placeId: string) => {
    const liked = data?.likedByUser.has(placeId);
    if (liked) {
      unlikeMutation.mutate(placeId);
    } else {
      likeMutation.mutate(placeId);
    }
  };

  return {
    likedByUser: data?.likedByUser ?? new Set<string>(),
    counts: data?.counts ?? {},
    isLoading,
    toggleLike,
  };
}
