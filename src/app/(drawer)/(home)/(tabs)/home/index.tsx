import { Button, Pressable, Text, View, FlatList, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { Events, User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import UserList from "@/components/UserList";
import AnnouncementBoard from "@/components/AnnouncementBoard";
import HostRotation from "@/components/HostRotation";

import Participation from "@/components/Participation";
import Background from "@/components/Background";

export default function HomeScreen() {
  const supabase = useSupabase();

  const { data, isLoading, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        console.log(
          "Supabase users error (raw):",
          JSON.stringify(error, null, 2)
        );
        throw new Error(error.message);
      }
      console.log("Supabase users data (processed):", data);
      return data;
    },
  });

  const {
    data: eventsData = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = useQuery<Events[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*");
      if (error) {
        console.log(
          "Supabase events error (raw):",
          JSON.stringify(error, null, 2)
        );
        throw new Error(error.message);
      }
      console.log("Supabase events data (processed):", data);
      return (data ?? []) as Events[];
    },
  });

  if (error) {
    console.log("React Query error object:", error);
  }
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const nextEvent = eventsData.at(-1) ?? null;
  const hostUser = data?.find((u) => u.id === nextEvent?.host_id) ?? null;

  console.log("Fetched users:", eventsData);
  return (
    <View className="flex-1 relative ">
      <Background />
      <View className="flex-1 items-center pt-32    ">
        <AnnouncementBoard event={nextEvent} host={hostUser} />

        {data ? (
          <HostRotation data={data} />
        ) : (
          <Text>Keine Benutzer gefunden.</Text>
        )}

        <Participation event={nextEvent} />
      </View>
    </View>
  );
}
