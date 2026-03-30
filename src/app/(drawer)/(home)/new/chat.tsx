import UserList from "@/components/UserList";
import { Text, View } from "react-native";
import { User } from "@/types";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { use } from "react";
import { router } from "expo-router";
import Background from "@/components/Background";

export default function NewChatScreen() {
  const supabase = useSupabase();
  const { user } = useUser();

  const createChannel = useMutation({
    mutationFn: async (clickedUser: User) => {
      const { data: channel } = await supabase
        .from("channels")
        .insert({
          type: "direct",
        })
        .throwOnError()
        .select("*")
        .single();

      if (!channel) {
        {
          throw new Error("Channel creation failed");
        }
      }

      await supabase
        .from("channel_users")
        .insert([
          {
            channel_id: channel.id,
            user_id: clickedUser.id,
          },
        ])
        .throwOnError();

      await supabase
        .from("channel_users")
        .insert([
          {
            channel_id: channel.id,
            user_id: user!.id,
          },
        ])
        .throwOnError();

      return channel;
    },
    onSuccess(newChannel) {
      router.back();
      router.push(`/chatDetails/${newChannel.id}`);
    },
  });

  const handleUserPress = (user: User) => {
    console.log("User selected:", user.first_name);
    createChannel.mutate(user);
  };

  return (
    <View>
      <UserList onPress={handleUserPress} />
    </View>
  );
}
