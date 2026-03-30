import { FlatList, View } from "react-native";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/SupabaseProvider";
import { Channel } from "@/types";
import { useUser } from "@clerk/clerk-expo";
import LottieView from "lottie-react-native";
import { useChannel } from "@/providers/ChannelProvider";

export default function MessageListData() {
  const supabase = useSupabase();
  const { user } = useUser();
  const { channel } = useChannel();
  if (!channel) {
    return null;
  }
  //ToDo Pagination
  const {
    data: messages,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["messages", channel.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channel.id)
        .order("created_at", { ascending: false })
        .throwOnError();

      return data;
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center mb-4  ">
        <LottieView
          source={require("../../assets/loading.json")}
          autoPlay
          loop
          style={{ width: 350, height: 350 }}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={messages}
      contentContainerClassName="p-4"
      renderItem={({ item }) => (
        <MessageList message={item} isOwnMessage={item.user_id === user?.id} />
      )}
      inverted
      showsVerticalScrollIndicator={false}
    />
  );
}
