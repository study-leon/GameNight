import { View, Text, Image } from "react-native";
import { Message } from "@/types";
import SupaImage from "./SupaImage";

type MessageListProps = {
  message: Message;

  isOwnMessage?: boolean;
};

export default function MessageList({
  message,
  isOwnMessage,
}: MessageListProps) {
  return (
    <View
      className={`mb-4 flex-row ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <View
        className={`max-w-[75%] gap-2 ${isOwnMessage ? "items-end" : "items-start"}`}
      >
        {message.image && (
          <SupaImage
            path={message.image}
            className="w-48 h-48 mb-2 rounded-lg"
          />
        )}

        {message.content && (
          <View
            className={`rounded-2xl px-4 py-2 ${isOwnMessage ? " bg-[#6C63FF] rounded-br-md" : " bg-gray-200 rounded-bl-md"}`}
          >
            <Text
              className={`text-xl ${isOwnMessage ? "text-white" : "text-neutral-900"}`}
            >
              {message.content}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
