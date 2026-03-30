import { View, Text, ScrollView, Dimensions } from "react-native";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import Background from "@/components/Background";

type GameVoteStat = {
  event_id: string;
  game_id: string;
  name: string;
  likes: number;
  dislikes: number;
};

type GameStatisticsProps = {
  eventId: string | null;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;
const EIGHTY_VH = SCREEN_HEIGHT * 0.8;

export default function VoteStatsScreen({ eventId }: GameStatisticsProps) {
  const supabase = useSupabase();

  const {
    data: stats = [] as GameVoteStat[],
    isLoading,
    error,
  } = useQuery<GameVoteStat[], Error>({
    queryKey: ["gameVoteStats", eventId],
    queryFn: async () => {
      const query = supabase.from("game_vote_stats").select("*");

      if (eventId) {
        query.eq("event_id", eventId);
      }

      const { data, error } = await query;

      console.log("Game Vote Stats Data:", data);
      if (error) {
        console.log("Error loading game_vote_stats:", error);
        throw error;
      }

      return (data ?? []) as GameVoteStat[];
    },
  });

  const enhancedStats = useMemo(
    () =>
      stats.map((s: GameVoteStat) => {
        const totalVotes = s.likes + s.dislikes;
        const likeRatio =
          totalVotes === 0 ? 0 : s.likes / (s.likes + s.dislikes);

        return {
          ...s,
          totalVotes,
          likeRatio,
        };
      }),
    [stats]
  );

  const topByLikes = useMemo(() => {
    if (enhancedStats.length === 0) return null;
    return [...enhancedStats].sort((a, b) => b.likes - a.likes)[0];
  }, [enhancedStats]);

  const topByRatio = useMemo(() => {
    if (enhancedStats.length === 0) return null;
    const withMinVotes = enhancedStats.filter((s) => s.totalVotes >= 3);
    if (withMinVotes.length === 0) return null;
    return [...withMinVotes].sort((a, b) => b.likeRatio - a.likeRatio)[0];
  }, [enhancedStats]);

  return (
    <View className="flex-1 mt-32">
      <Background />

      <View className="px-4 pt-8 pb-4 " style={{ height: EIGHTY_VH }}>
        {/* Titel */}
        <Text className="text-white text-2xl font-bold mb-1">
          Voting-Statistik
        </Text>
        <Text className="text-gray-300 text-sm mb-4">
          Welche Spiele kommen gut an?
        </Text>

        {isLoading && (
          <Text className="text-white mb-2">Lade Statistik...</Text>
        )}

        {error && (
          <Text className="text-red-400 mb-2">
            Fehler beim Laden der Statistik.
          </Text>
        )}

        {!isLoading && enhancedStats.length === 0 && (
          <Text className="text-gray-300">
            Noch keine Votes für dieses Event vorhanden.
          </Text>
        )}

        {/* 🔹 Top-Bereich als „Balken“ / Card über die ganze Breite */}
        {!isLoading && enhancedStats.length > 0 && (
          <View className="mb-4 bg-[#1C1C24] border border-[#1E293B] rounded-2xl p-4">
            <View className="flex-row gap-3 ">
              {/* Meiste Likes */}
              {topByLikes && (
                <View className="flex-1 bg-[#1E293B] rounded-xl p-3">
                  <Text className="text-[10px] text-gray-400 uppercase">
                    Meiste Likes
                  </Text>
                  <Text
                    className="text-white text-base font-semibold mt-1"
                    numberOfLines={1}
                  >
                    {topByLikes.name}
                  </Text>
                  <Text className="text-gray-300 text-xs mt-1">
                    👍 {topByLikes.likes} · 👎 {topByLikes.dislikes}
                  </Text>
                  <View className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <View
                      className="h-1.5 bg-[#22c55e]"
                      style={{
                        width: `${Math.round(topByLikes.likeRatio * 100)}%`,
                      }}
                    />
                  </View>
                  <Text className="text-[10px] text-gray-400 mt-1">
                    {topByLikes.totalVotes} Votes ·{" "}
                    {Math.round(topByLikes.likeRatio * 100)}% Likes
                  </Text>
                </View>
              )}

              {/* Beste Ratio */}
              {topByRatio && (
                <View className="flex-1 bg-[#1E293B] rounded-xl p-3">
                  <Text className="text-[10px] text-gray-400 uppercase">
                    Beste Like-Ratio
                  </Text>
                  <Text
                    className="text-white text-base font-semibold mt-1"
                    numberOfLines={1}
                  >
                    {topByRatio.name}
                  </Text>
                  <Text className="text-gray-300 text-xs mt-1">
                    👍 {Math.round(topByRatio.likeRatio * 100)}% Likes
                  </Text>
                  <View className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <View
                      className="h-1.5 bg-[#6C63FF]"
                      style={{
                        width: `${Math.round(topByRatio.likeRatio * 100)}%`,
                      }}
                    />
                  </View>
                  <Text className="text-[10px] text-gray-400 mt-1">
                    {topByRatio.totalVotes} Votes (min. 3)
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 🔹 Trenner / Section-Header */}
        {enhancedStats.length > 0 && (
          <View className="flex-row items-center mb-3 ">
            <Text className="text-gray-200 font-semibold">
              Alle Spiele im Voting
            </Text>
            <View className="flex-1 h-[1px] bg-slate-700 ml-3" />
          </View>
        )}

        {/* 🔹 Liste aller Spiele mit Balken */}
        <View className="flex-1 h-56 ">
          <ScrollView className="flex-1 ">
            {enhancedStats
              .slice()
              .sort((a, b) => b.likes - a.likes)
              .map((game, index) => {
                const ratioPercent =
                  game.totalVotes === 0 ? 0 : Math.round(game.likeRatio * 100);

                return (
                  <View
                    key={game.game_id}
                    className="bg-[#020617]/70 border border-[#1E293B] rounded-xl p-4 mb-3"
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-gray-500">
                          #{index + 1}
                        </Text>
                        <Text className="text-white text-base font-semibold">
                          {game.name}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-400">
                        {game.totalVotes} Votes
                      </Text>
                    </View>

                    <Text className="text-gray-300 text-xs mb-2">
                      👍 {game.likes} · 👎 {game.dislikes} · {ratioPercent}%
                      Likes
                    </Text>

                    {/* Balken für Like-Ratio */}
                    <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <View
                        className="h-2 bg-[#22c55e]"
                        style={{
                          width: `${ratioPercent}%`,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
