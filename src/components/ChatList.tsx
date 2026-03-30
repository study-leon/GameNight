import { ChannelWithUsers } from "@/types";
import { Pressable, Text, Image, View } from "react-native";
import { Link } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { de } from "date-fns/locale";

type ChatListProps = {
  channel: ChannelWithUsers;
};

export default function ChatList({ channel }: ChatListProps) {
  const { user } = useUser();

  useEffect(() => {
    console.log("Channel prop updated:", channel);
  }, [channel]);

  let chatName = channel.name;
  const otherUser = channel.users.find((u) => u.id !== user!.id);

  if (channel.type === "direct") {
    chatName = otherUser?.full_name || "Unbekannter Benutzer";
  }
  return (
    <Link href={`/chatDetails/${channel.id}`} asChild>
      <Pressable className="flex-row gap-3 p-4 mb-3 border-b border-gray-300 rounded-xl items-center ">
        {/* Image*/}

        <View className="w-12 h-12 rounded-full bg-[#6C63FF] justify-center items-center">
          <Text className="text-xl text-white font-bold">
            {otherUser?.first_name?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="font-bold text-lg text-white" numberOfLines={1}>
            {chatName}
          </Text>
          <Text className="text-sm text-[#E9E8FA]" numberOfLines={1}>
            {channel.last_message || "Noch keine Nachrichten"}
          </Text>
        </View>
        {channel.last_message_at && (
          <Text className="text-xs text-[#E9E8FA]">
            {formatDistanceToNow(new Date(channel.last_message_at), {
              addSuffix: true,
              locale: de,
            })}
          </Text>
        )}
      </Pressable>
    </Link>
  );
}
