import React, { useMemo } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator } from "react-native";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import Background from "@/components/Background";
import { Events, Games, User, Review } from "@/types";
import { FontAwesome } from "@expo/vector-icons";

type ReviewGameRatingRow = {
  review_id: string;
  game_id: string;
  rating: number;
};

export default function StatisticsScreen() {
  const supabase = useSupabase();
  const { user } = useUser();

  // 1) letztes Event des Hosts
  const { data: latestEvent, isLoading: eventLoading } =
    useQuery<Events | null>({
      queryKey: ["latestEventStatistics"],
      enabled: !!user?.id,
      queryFn: async (): Promise<Events | null> => {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("host_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.log("Error loading latest event:", error);
          return null;
        }
        return data ?? null;
      },
    });

  // 2) alle Reviews zu diesem Event
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["reviewsByEvent", latestEvent?.id],
    enabled: !!latestEvent?.id,
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id, user_id, event_id, overall_rating, overall_comment, host_rating, host_comment, food_rating, food_comment, created_at"
        )
        .eq("event_id", latestEvent!.id);

      if (error) {
        console.log("Error loading reviews:", error);
        throw error;
      }
      return (data ?? []) as Review[];
    },
  });

  // 3) User zu den Reviews laden (für Namen / Avatar)
  const { data: usersById = {}, isLoading: usersLoading } = useQuery<
    Record<string, User>
  >({
    queryKey: ["usersForReviews", reviews.map((r) => r.user_id)],
    enabled: reviews.length > 0,
    queryFn: async () => {
      const uniqueUserIds = Array.from(
        new Set(
          reviews
            .map((r) => r.user_id)
            .filter((id): id is string => id !== null)
        )
      );

      if (uniqueUserIds.length === 0) {
        return {};
      }

      const { data, error } = await supabase
        .from("users") // ggf. "profiles"
        .select("*")
        .in("id", uniqueUserIds);

      if (error) {
        console.log("Error loading users:", error);
        throw error;
      }

      const map: Record<string, User> = {};
      (data ?? []).forEach((u) => {
        map[u.id] = u as User;
      });
      return map;
    },
  });

  // Review-IDs für Ratings
  const reviewIds = useMemo(() => reviews.map((r) => r.id), [reviews]);

  // 4) alle Game-Ratings zu diesen Reviews
  const { data: gameRatings = [], isLoading: gameRatingsLoading } = useQuery<
    ReviewGameRatingRow[]
  >({
    queryKey: ["gameRatingsForEvent", latestEvent?.id, reviewIds],
    enabled: !!latestEvent?.id && reviewIds.length > 0,
    queryFn: async (): Promise<ReviewGameRatingRow[]> => {
      const { data, error } = await supabase
        .from("review_game_ratings")
        .select("review_id, game_id, rating")
        .in("review_id", reviewIds);

      if (error) {
        console.log("Error loading game ratings:", error);
        throw error;
      }

      console.log("Game ratings rows:", data);
      return (data ?? []) as ReviewGameRatingRow[];
    },
  });

  // 5) alle Games, die in Ratings vorkommen
  const gameIds = useMemo(
    () => Array.from(new Set(gameRatings.map((r) => r.game_id))),
    [gameRatings]
  );

  const { data: gamesForStats = [], isLoading: gamesForStatsLoading } =
    useQuery<Games[]>({
      queryKey: ["gamesForStats", gameIds],
      enabled: gameIds.length > 0,
      queryFn: async (): Promise<Games[]> => {
        const { data, error } = await supabase
          .from("games")
          .select("id, name, image_url")
          .in("id", gameIds);

        if (error) {
          console.log("Error loading games for stats:", error);
          throw error;
        }

        console.log("Games for stats:", data);
        return (data ?? []) as Games[];
      },
    });

  // 6) Durchschnitt pro Game berechnen (pure JS, kein async)
  const gameStats = useMemo(() => {
    if (gameRatings.length === 0 || gamesForStats.length === 0) return [];

    const gameMap = new Map<string, Games>();
    gamesForStats.forEach((g) => gameMap.set(g.id, g));

    const stats = new Map<
      string,
      {
        gameId: string;
        name: string;
        image_url: string | null;
        sum: number;
        count: number;
      }
    >();

    gameRatings.forEach((r) => {
      const game = gameMap.get(r.game_id);
      if (!game) return;

      const existing = stats.get(r.game_id);
      if (!existing) {
        stats.set(r.game_id, {
          gameId: r.game_id,
          name: game.name,
          image_url: (game as any).image_url ?? null, // je nach Typ
          sum: r.rating,
          count: 1,
        });
      } else {
        existing.sum += r.rating;
        existing.count += 1;
      }
    });

    return Array.from(stats.values()).map((g) => ({
      ...g,
      avg: g.sum / g.count,
    }));
  }, [gameRatings, gamesForStats]);

  // Loading-Check
  const isAnyLoading =
    eventLoading ||
    reviewsLoading ||
    usersLoading ||
    gameRatingsLoading ||
    gamesForStatsLoading;

  if (isAnyLoading) {
    return (
      <View className="flex-1 bg-[#121212] items-center justify-center">
        <ActivityIndicator />
        <Text className="text-white mt-2">Lade Statistik...</Text>
      </View>
    );
  }

  if (!latestEvent) {
    return (
      <View className="flex-1 bg-[#121212] items-center justify-center">
        <Text className="text-white text-lg font-semibold">
          Noch kein Event gefunden.
        </Text>
        <Text className="text-gray-400 mt-1 text-center px-6">
          Erstelle zuerst ein Event, um Bewertungen und Statistiken zu sehen.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 relative">
      <Background />

      <View className="flex-1 mt-36 px-4 pb-6">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text className="text-3xl text-white font-bold mb-1">Statistik</Text>
          <Text className="text-gray-300 mb-4">
            Event: {latestEvent.location} –{" "}
            {latestEvent.date_time
              ? new Date(latestEvent.date_time).toLocaleString()
              : "Datum unbekannt"}
          </Text>

          {/* Game-Statistiken */}
          <View className="bg-[#1C1C24] rounded-2xl p-4 mb-4">
            <Text className="text-white text-lg font-semibold mb-2">
              Spiele & Durchschnittsbewertung
            </Text>

            {gameStats.length === 0 ? (
              <Text className="text-gray-400">
                Es wurden noch keine Spiele bewertet.
              </Text>
            ) : (
              gameStats.map((g) => (
                <View key={g.gameId} className="flex-row items-center mb-3">
                  {g.image_url ? (
                    <Image
                      source={{ uri: g.image_url }}
                      className="w-12 h-12 rounded-lg mr-3"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-lg mr-3 bg-[#2A2A36] items-center justify-center">
                      <Text className="text-white text-lg font-bold">
                        {g.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View className="flex-1">
                    <Text className="text-white font-semibold">{g.name}</Text>
                    <View className="flex-row items-center mt-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <FontAwesome
                          key={idx}
                          name={
                            idx + 1 <= Math.round(g.avg) ? "star" : "star-o"
                          }
                          size={18}
                          color="#FFC107"
                          style={{ marginRight: 2 }}
                        />
                      ))}
                      <Text className="text-gray-300 ml-2">
                        {g.avg.toFixed(1)} / 5 ({g.count} Votes)
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Review-Messageboard */}
          <View className="bg-[#1C1C24] rounded-2xl p-4 mb-4">
            <Text className="text-white text-lg font-semibold mb-2">
              Alle Reviews
            </Text>

            {reviews.length === 0 ? (
              <Text className="text-gray-400">
                Es wurden noch keine Reviews abgegeben.
              </Text>
            ) : (
              reviews.map((review) => {
                if (!review.user_id) return null;
                const reviewUser = usersById[review.user_id];

                const displayName =
                  reviewUser?.full_name ||
                  reviewUser?.first_name ||
                  "Unbekannter Spieler";

                return (
                  <View
                    key={review.id}
                    className="border-b border-[#2A2A36] pb-3 mb-3"
                  >
                    <View className="flex-row items-center mb-1">
                      {reviewUser?.avatar_url ? (
                        <Image
                          source={{ uri: reviewUser.avatar_url }}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : (
                        <View className="w-8 h-8 rounded-full bg-[#6C63FF] items-center justify-center mr-2">
                          <Text className="text-white font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}

                      <View className="flex-1">
                        <Text className="text-white font-semibold">
                          {displayName}
                        </Text>
                        <Text className="text-gray-400 text-xs">
                          {new Date(review.created_at).toLocaleString()}
                        </Text>
                      </View>

                      {review.overall_rating != null && (
                        <View className="flex-row items-center">
                          <FontAwesome name="star" size={16} color="#FFC107" />
                          <Text className="text-white ml-1">
                            {review.overall_rating.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {review.overall_comment ? (
                      <Text className="text-gray-200 mt-1">
                        {review.overall_comment}
                      </Text>
                    ) : null}

                    <View className="mt-2 flex-row flex-wrap gap-x-3">
                      {review.host_rating != null && (
                        <Text className="text-gray-300 text-xs">
                          Host: {review.host_rating}/5
                        </Text>
                      )}
                      {review.food_rating != null && (
                        <Text className="text-gray-300 text-xs">
                          Food: {review.food_rating}/5
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
