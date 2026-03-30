import { View, Text, FlatList, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types";

type HostRotationProps = {
  data: User[];
};

export default function HostRotation({ data }: HostRotationProps) {
  return (
    <View className="mt-2 px-4 py-2  w-[90%]">
      <Text className="text-2xl font-bold mb-2 text-white">Spieler</Text>
      <View className="border-t border-gray-300 pt-4">
        <View className="flex-row  mb-2">
          <FlatList
            data={data}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View className="flex-row items-center mr-4">
                {/* Avatar oder Initial */}
                {item.avatar_url ? (
                  <View className="items-center mr-2">
                    <Image
                      source={{ uri: item.avatar_url }}
                      className="w-14 h-14 rounded-full border-2 border-[#6C63FF]"
                    />
                    <Text className="text-center mt-1 text-white">
                      {item.first_name}
                    </Text>
                  </View>
                ) : (
                  <View className="w-14 h-14 rounded-full bg-neutral-700 justify-center items-center border-2 border-[#6C63FF] mr-2">
                    <Text className="text-xl text-white font-bold">
                      {item.first_name?.charAt(0).toUpperCase() || "?"}
                    </Text>
                  </View>
                )}

                {/* 👉 Pfeil NUR beim ersten Item */}
                {index === 0 && (
                  <View className="w-14 h-14 mb-3 ">
                    <Ionicons
                      name="arrow-forward-circle"
                      size={42}
                      color="#A3A3FF"
                      style={{ marginLeft: 6 }}
                    />
                  </View>
                )}
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}
