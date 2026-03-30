import { FlatList, Pressable, View, TextInput, Text } from "react-native";

import ChatList from "@/components/ChatList";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/SupabaseProvider";
import LottieView from "lottie-react-native";
import { useUser } from "@clerk/clerk-expo";
import Background from "@/components/Background";

export default function ChatScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const supabase = useSupabase();
  const { user } = useUser();

  //ToDo Pagination
  const {
    data: channels,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data } = await supabase
        .from("channel_users")
        .select("*, channels(*, users(*))")
        .eq("user_id", user!.id)
        .throwOnError();

      const channels = data.map((m) => m.channels);
      console.log("channels", JSON.stringify(channels, null, 2));

      return channels;
    },
  });

  const filteredChannels = channels?.filter((channel) =>
    channel.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (isLoading) {
    return (
      <View className="flex-1  justify-center  items-center absolute w-full h-full bg-white top-80">
        <LottieView
          source={require("../../../../../../assets/loading.json")}
          autoPlay
          loop
          style={{ width: 350, height: 350 }}
        />
      </View>
    );
  }

  if (error) {
    return <Text>{error.message}</Text>;
  }

  return (
    <View className=" flex-1 relative ">
      <Background />
      <View className="bg-transparent  h-[90vh]">
        <View className="mt-40  px-3">
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Suche"
            className=" p-4 rounded-full bg-white"
          />
        </View>
        <FlatList
          className="pt-4  "
          contentContainerClassName="flex "
          data={channels}
          renderItem={({ item }) => <ChatList channel={item} />}
          contentInsetAdjustmentBehavior="automatic"
        />
        <Pressable
          onPress={() => {
            router.push("../new/chat");
          }}
          android_ripple={{ color: "rgba(0,0,0,0.12)", borderless: true }}
          className="flex-row items-center justify-center absolute -bottom-10 mb-2 right-5 bg-[#6C63FF]  p-4 rounded-full shadow-lg active:scale-95 active:opacity-80"
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
