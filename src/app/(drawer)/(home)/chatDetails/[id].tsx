import { Stack, useLocalSearchParams } from "expo-router";
import { View, Text, FlatList, KeyboardAvoidingView } from "react-native";
import channels from "@/data/channels";
import messages from "@/data/messages";
import MessageListData from "@/components/MessageListData";
import MessageInput from "@/components/MessageInput";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/SupabaseProvider";
import LottieView from "lottie-react-native";
import { useUser } from "@clerk/clerk-expo";
import ChannelProvider, { useChannel } from "@/providers/ChannelProvider";

function StackHeader() {
  const { channel } = useChannel();
  const { user } = useUser();
  if (!channel) {
    return null;
  }

  let chatName = channel.name || "Unbenannter Chat";
  const otherUser = channel.users.find((u) => u.id !== user!.id);

  if (channel.type === "direct") {
    chatName = otherUser?.full_name || "Unbekannter Benutzer";
  }

  return (
    <Stack.Screen
      options={{
        title: chatName || "Chat",
        headerBackground: () => <View className="bg-[#6C63FF]" />,
        headerStyle: { backgroundColor: "#6C63FF" },
        headerTintColor: "#fff",
      }}
    />
  );
}

export default function ChatDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ChannelProvider id={id}>
      <StackHeader />

      <MessageListData />
      <MessageInput />
    </ChannelProvider>
  );
}
