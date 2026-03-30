import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity, View, Text } from "react-native";

export default function HostLayoutSetting() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={({ navigation }) => ({
          headerTransparent: true,
          headerLargeTitle: Platform.OS === "ios",
          header: () => (
            <View className="pt-16 pb-6 px-4 bg-[#6C63FF]">
              <View className="flex-row justify-between items-center">
                <View className="   ">
                  <Text className="text-4xl text-white pl-2  font-extrabold   ">
                    {" "}
                    GameNight Host
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.toggleDrawer()}
                  className="bg-white  p-2 rounded-full"
                >
                  <Ionicons name="settings-outline" size={28} color="gray" />
                </TouchableOpacity>
              </View>
            </View>
          ),
        })}
      />
    </Stack>
  );
}
