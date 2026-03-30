// src/app/(drawer)/game-selection.tsx
import { View, Text, ScrollView } from "react-native";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useQuery } from "@tanstack/react-query";
import { Games } from "@/types";
import { GameSelectionList } from "@/components/GameSelectionList";
import { useGameSelection } from "@/providers/GameSelectionProvider";
import { router } from "expo-router";
import Background from "@/components/Background";

export default function GameSelectionScreen() {
  const supabase = useSupabase();
  const { selectedGameIds, toggleGame, resetSelection } = useGameSelection();

  const {
    data: gamesData = [],
    isLoading,
    error,
  } = useQuery<Games[]>({
    queryKey: ["gamesForEvent"],
    queryFn: async (): Promise<Games[]> => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .throwOnError();

      return data ?? [];
    },
  });

  return (
    <View className="flex-1 ">
      <Background />

      <View className="flex-1 px-4 pt-16 ">
        {isLoading && <Text className="text-white mb-2">Lade Spiele...</Text>}
        {error && (
          <Text className="text-red-400 mb-2">
            Fehler beim Laden der Spiele.
          </Text>
        )}

        <ScrollView className="flex-1">
          <GameSelectionList
            games={gamesData}
            selectedGameIds={selectedGameIds}
            onToggleGame={toggleGame}
            onAddNewGame={() => router.push("/games/gameAdd")}
          />
        </ScrollView>
      </View>
    </View>
  );
}
