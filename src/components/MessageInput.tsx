import {
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { Channel } from "@/types";
import { useChannel } from "@/providers/ChannelProvider";
import { uploadImage } from "@/utils/storage";

export default function MessageInput() {
  const { channel, realTimeChannel } = useChannel();
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const supabase = useSupabase();
  const { user } = useUser();

  const queryClient = useQueryClient();

  if (!channel) {
    return null;
  }
  //Optimistic Update
  const newMessageMutation = useMutation({
    mutationFn: async (image: string | null) => {
      const { data } = await supabase
        .from("messages")
        .insert({
          content: message,
          user_id: user!.id,
          channel_id: channel.id,
          image,
        })
        .select("*")
        .single()
        .throwOnError();
      return data;
    },
    onSuccess(newMessage) {
      queryClient.invalidateQueries({ queryKey: ["messages", channel.id] });

      if (realTimeChannel) {
        realTimeChannel.send({
          type: "broadcast",
          event: "message_sent",
          payload: newMessage,
        });
      }

      setMessage("");
      setImage(null);
    },
    onError(error) {
      Alert.alert(
        "Fehler",
        "Nachricht konnte nicht gesendet werden." + error.message
      );
    },
  });

  const last_message = useMutation({
    mutationFn: async (content: string) => {
      console.log(channel.id);
      const { data, error } = await supabase
        .from("channels")
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", channel.id)
        .select("*")
        .single();
      console.log("Updated channel last message:", data);

      if (error) {
        console.log("Error updating last message:", error);
        throw error;
      }
      console.log("Updated channel last message:", data);
      return data;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
    onError(error) {
      Alert.alert(
        "Fehler",
        "Letzte Nachricht konnte nicht aktualisiert werden." + error.message
      );
    },
  });

  const handleSend = async () => {
    let supaImage: string | null = null;
    if (image) {
      supaImage = await uploadImage(supabase, image);
    }
    newMessageMutation.mutate(supaImage);
    console.log(message);
    last_message.mutate(message);
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const isMessageEmpty = !message && !image;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <SafeAreaView
        edges={["bottom"]}
        className="bg-white p-4  border-t border-gray-200 shadow-lg shadow-slate-300"
      >
        {image && (
          <View className="w-32 h-32 mb-2">
            <Image source={{ uri: image }} className="w-full h-full" />
            <Pressable
              onPress={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-gray-300 w-6 h-6 items-center justify-center rounded-full "
            >
              <Ionicons name="close" size={16} color="dimgray" />
            </Pressable>
          </View>
        )}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={pickImage}
            className="bg-[#6C63FF] rounded-full p-2 w-10 h-10"
          >
            <Ionicons name="image" size={20} color="white" />
          </Pressable>
          <TextInput
            className="bg-gray-100 flex-1  rounded-3xl px-4 py-3 text-gray-900 text-base max-h-[120px]"
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={isMessageEmpty}
            className={`${!isMessageEmpty ? "bg-[#6C63FF]" : "bg-gray-200"} rounded-full p-2 w-10 h-10 justify-center items-center`}
          >
            <Ionicons
              name="send"
              size={20}
              color={isMessageEmpty ? "#9CA3AF" : "white"}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
