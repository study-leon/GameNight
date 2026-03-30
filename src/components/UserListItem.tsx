import { User } from "@/types";
import { View, Text, Image, Pressable } from "react-native";

interface UserListItemProps {
  user: User;
  onPress?: (user: User) => void;
}

export default function UserListItem({ user, onPress }: UserListItemProps) {
  return (
    <Pressable
      onPress={() => onPress?.(user)}
      className="flex-row items-center gap-4 p-4 border-b border-gray-200"
    >
      <View className="bg-gray-200 w-12 h-12  rounded-full items-center justify-center ">
        {user.avatar_url ? (
          <Image
            source={{ uri: user.avatar_url }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <View className=" rounded-full ">
            <Text className="text-gray-500 font-medium text-center">
              {user.first_name?.charAt(0)}
              {user.last_name?.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-gray-900 font-medium">
        {user.first_name} {user.last_name}
      </Text>
    </Pressable>
  );
}
