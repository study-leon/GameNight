import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import Background from "@/components/Background";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Events } from "@/types";
import { router } from "expo-router";
import { Games, User } from "@/types";

type Game = {
  id: string;
  title: string;
  image: string;
};

const StarRow = ({
  rating,
  onChange,
}: {
  rating: number;
  onChange?: (value: number) => void;
}) => {
  return (
    <View className="flex-row mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          disabled={!onChange}
          onPress={() => onChange && onChange(star)}
          className="mr-1"
        >
          <FontAwesome
            name={star <= rating ? "star" : "star-o"}
            size={30}
            color="#FFC107"
          />
        </Pressable>
      ))}
    </View>
  );
};

const RatingCard = ({
  title,
  rating,
  setRating,
  comment,
  setComment,
}: {
  title: string;
  rating: number;
  setRating: (val: number) => void;
  comment: string;
  setComment: (val: string) => void;
}) => {
  return (
    <View className=" bg-[#1C1C24] rounded-2xl p-4 my-2">
      <Text className="font-semibold text-white text-base mb-1">{title}</Text>
      <StarRow rating={rating} onChange={setRating} />
      <TextInput
        placeholder="Dein Kommentar..."
        placeholderTextColor="#9CA3AF"
        value={comment}
        onChangeText={setComment}
        multiline
        style={{ textAlignVertical: "top", textDecorationColor: "white" }}
        className="mt-3 rounded-xl p-3 h-20 bg-[#2A2A36] text-white"
      />
    </View>
  );
};

export default function HomeScreen() {
  const [hostRating, setHostRating] = useState(5);
  const [hostComment, setHostComment] = useState("");

  const [foodRating, setFoodRating] = useState(3);
  const [foodComment, setFoodComment] = useState("");

  const [overallRating, setOverallRating] = useState(0);
  const [overallComment, setOverallComment] = useState("");

  const [gameRatings, setGameRatings] = useState<{ [id: string]: number }>({});

  const supabase = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: latestEvent, isLoading } = useQuery<Events | null>({
    queryKey: ["latestEvent"],
    queryFn: async (): Promise<Events | null> => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("host_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
        .throwOnError();

      return data ?? null;
    },
  });

  const { data: gamesForReview = [], isLoading: gamesLoading } = useQuery<
    Games[]
  >({
    queryKey: ["gamesForReview", latestEvent?.id],
    enabled: !!latestEvent?.id,
    queryFn: async (): Promise<Games[]> => {
      if (!latestEvent?.id) return [];

      const { data, error } = await supabase
        .from("game_votes")
        .select("game_id, games(*)")
        .eq("event_id", latestEvent.id);

      console.log("Games for review data:", data);

      if (error) {
        console.log("Error loading games for review:", error);
        throw error;
      }

      // data: { game_id: string; games: Games | null }[]
      const map = new Map<string, Games>();

      (data ?? []).forEach((row: any) => {
        if (row.games) {
          map.set(row.games.id, row.games);
        }
      });

      return Array.from(map.values());
    },
  });

  const gameRatingsMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const rows = Object.entries(gameRatings)
        .filter(([, rating]) => rating > 0) // nur Spiele, die bewertet wurden
        .map(([gameId, rating]) => ({
          review_id: reviewId,
          game_id: gameId,
          rating,
        }));

      if (rows.length === 0) {
        // nichts zu speichern, einfach raus
        return;
      }

      const { error } = await supabase.from("review_game_ratings").insert(rows);

      if (error) {
        console.error("Error inserting review_game_ratings:", error);
        throw error;
      }
    },
    onError: (error) => {
      Alert.alert(
        "Fehler",
        "Beim Speichern der Spielbewertungen ist ein Fehler aufgetreten."
      );
      console.error("Error saving game ratings:", error);
    },
  });
  const reviewMutation = useMutation({
    mutationFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .insert({
          user_id: user?.id,
          event_id: latestEvent?.id,
          host_rating: hostRating,
          host_comment: hostComment,
          food_rating: foodRating,
          food_comment: foodComment,
          overall_rating: overallRating,
          overall_comment: overallComment,
        })
        .select("*")
        .single()
        .throwOnError();
      return data;
    },
    onSuccess: (review) => {
      gameRatingsMutation.mutate(review.id);

      Alert.alert("Erfolg", "Deine Bewertung wurde erfolgreich abgegeben.");
      queryClient.invalidateQueries({ queryKey: ["latestEvent"] });
      console.log("Review submitted successfully");
    },
    onError: (error) => {
      Alert.alert(
        "Fehler",
        "Beim Absenden der Bewertung ist ein Fehler aufgetreten."
      );
      console.error("Error submitting review:", error);
    },
  });

  if (isLoading || !latestEvent || !latestEvent.date_time) {
    return null;
  }

  const eventStart = new Date(latestEvent.date_time);
  const reviewAllowedAt = new Date(eventStart.getTime() + 5 * 60 * 60 * 1000);
  const canReview = new Date() >= reviewAllowedAt;

  return (
    <View className="flex-1 relative ">
      <Background />
      <View className="bg-transparent mt-36 h-[80vh]">
        {/* Scrollbarer Content zwischen Header und Navbar */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {canReview ? (
            <View className="px-4 pt-1 pb-20 gap-2">
              {/* Header */}
              <View className="flex-row mb-4 items-center justify-between">
                <Text className="text-3xl text-white  font-bold my-2">
                  Bewerte den Abend
                </Text>
                <Pressable
                  onPress={() => {
                    router.navigate("/review/statistics");
                  }}
                  className="items-center justify-center bg-[#6C63FF] w-14 h-14 mt-1 rounded-xl"
                >
                  <Ionicons name="stats-chart" size={30} color="white" />
                </Pressable>
              </View>
              {/* Game Carousel */}
              <FlatList
                data={gamesForReview}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
                renderItem={({ item }) => (
                  <View className="w-64 bg-[#1C1C24] rounded-2xl mr-3 p-3 items-center">
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        resizeMode="cover"
                        className="w-full h-40 rounded-2xl"
                      />
                    ) : (
                      <Image
                        source={{
                          uri: "https://plus.unsplash.com/premium_photo-1671683371896-53dc511734c3?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                        }}
                        resizeMode="cover"
                        className="w-full h-40 rounded-2xl"
                      />
                    )}
                    <Text className="text-center mt-2 font-semibold text-white">
                      {item.name}
                    </Text>
                    <StarRow
                      rating={gameRatings[item.id] ?? 0}
                      onChange={(val) =>
                        setGameRatings((prev) => ({ ...prev, [item.id]: val }))
                      }
                    />
                  </View>
                )}
              />

              {/* Host Rating */}
              <RatingCard
                title="Rate the Host"
                rating={hostRating}
                setRating={setHostRating}
                comment={hostComment}
                setComment={setHostComment}
              />

              {/* Food Rating */}
              <RatingCard
                title="Rate the Food"
                rating={foodRating}
                setRating={setFoodRating}
                comment={foodComment}
                setComment={setFoodComment}
              />

              {/* Overall Evening */}
              <RatingCard
                title="Rate the Overall Evening"
                rating={overallRating}
                setRating={setOverallRating}
                comment={overallComment}
                setComment={setOverallComment}
              />

              <Pressable
                onPress={() => {
                  console.log("Submitting review...");

                  reviewMutation.mutate();
                }}
                className="mt-4 bg-[#6C63FF] py-3 rounded-full items-center"
              >
                <Text className="text-white font-semibold">Submit Review</Text>
              </Pressable>
            </View>
          ) : (
            <View className="px-4 pt-1 flex-col items-center pb-20 h-[80vh] justify-center ">
              <Text className="text-2xl text-white text-center font-bold mt-4">
                Du kannst deine Bewertung erst 5 Stunden nach dem Event abgeben.
              </Text>
              <View className="items-center justify-center">
                <LottieView
                  source={require("@/../assets/Waiting.json")}
                  autoPlay
                  loop
                  style={{ width: 250, height: 250 }}
                />
              </View>
              <Pressable
                onPress={() => {
                  router.navigate("/review/statistics");
                }}
                className="items-center justify-center bg-[#6C63FF] p-4 mt-1 rounded-xl"
              >
                <Text className="text-white text-center text-xl  ">
                  Statistik Anzeigen
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
