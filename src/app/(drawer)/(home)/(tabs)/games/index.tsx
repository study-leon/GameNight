// src/app/(drawer)/home.tsx
import { Pressable, ScrollView, Text, View } from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";

import Background from "@/components/Background";
import SwipeVoting from "@/components/SwipeVoting";
import { Events, Games } from "@/types";
import { useGameSelection } from "@/providers/GameSelectionProvider";
import { router } from "expo-router";
import { useMemo } from "react";

export default function HomeScreen() {
  const supabase = useSupabase();
  const { user } = useUser();
  const { selectedGameIds } = useGameSelection();

  const { data: latestEvent } = useQuery<Events | null>({
    queryKey: ["latestEventForVoting", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Events | null> => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("host_id", user!.id) // oder weglassen, wenn alle Events gelten sollen
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log("Error loading latest event:", error);
        // wenn es einfach kein Event gibt, kannst du null zurückgeben
        if (error.code === "PGRST116") return null; // optional
        throw error;
      }

      return data ?? null;
    },
  });

  const {
    data: gamesData = [],
    isLoading,
    error,
  } = useQuery<Games[]>({
    queryKey: ["gamesForEvent"],
    queryFn: async (): Promise<Games[]> => {
      const { data, error } = await supabase.from("games").select("*");
      if (error) {
        console.log("Error loading games:", error);
        throw error;
      }
      console.log("Games Data:", data);
      return data ?? [];
    },
  });

  const selectedGames = useMemo(
    () =>
      selectedGameIds.length > 0
        ? gamesData.filter((g) => selectedGameIds.includes(g.id))
        : gamesData,
    [gamesData, selectedGameIds]
  );

  const voteMutation = useMutation({
    mutationFn: async ({
      gameId,
      vote,
    }: {
      gameId: string;
      vote: "like" | "dislike";
    }) => {
      if (!user) return;
      const { error } = await supabase.from("game_votes").insert({
        event_id: latestEvent?.id,
        game_id: gameId,
        user_id: user.id,
        vote,
      });

      if (error) {
        console.log("Error inserting vote:", error);
        throw error;
      }
    },
  });

  return (
    <View className="flex-1 relative">
      <Background />

      <View className="flex-1 px-4 pt-8">
        {isLoading && <Text className="text-white mb-2">Lade Spiele...</Text>}
        {error && (
          <Text className="text-red-400 mb-2">
            Fehler beim Laden der Spiele.
          </Text>
        )}

        <View className="flex-1 ">
          <SwipeVoting
            data={selectedGames}
            onVote={(game, direction) => {
              console.log(
                "VOTE:",
                direction === "right" ? "LIKE" : "DISLIKE",
                "→",
                game.id,
                game.name
              );

              voteMutation.mutate({
                gameId: game.id,
                vote: direction === "right" ? "like" : "dislike",
              });
            }}
          />
        </View>
      </View>
    </View>
  );
}
