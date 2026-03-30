import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { Events, User } from "@/types";

type AnnouncementBoardProps = {
  event: Events | null;
  host: User | null;
};

export default function AnnouncementBoard({
  event,
  host,
}: AnnouncementBoardProps) {
  const router = useRouter();

  function handlePress() {
    router.navigate("/home/hostSettings");
  }

  function formatDate(timestamp: string | null | undefined) {
    if (!timestamp) return "";

    return new Date(timestamp).toLocaleString("de-AT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <View className="mt-8 p-4 bg-[#1C1C24] rounded-lg shadow-lg w-[90%]">
      <View className="flex-row justify-between">
        <Text className="text-2xl font-bold mb-2 text-white">
          Nächster Spieleabend
        </Text>
        <Ionicons
          onPress={handlePress}
          name="settings"
          size={30}
          color="#A3A3FF"
          className="mb-2"
        />
      </View>
      <View className="flex-row justify-between items-center border-t border-gray-300 ">
        <View className="flex gap-5  pt-2">
          <View className="flex-row items-center mb-2 mt-4">
            <Ionicons name="calendar" size={30} color="#A3A3FF" />
            <View className="flex ml-2">
              <Text className="text-white">Datum und Zeit</Text>
              <Text className="text-gray-200 font-semibold">
                {formatDate(event?.date_time)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center mb-2">
            <Ionicons name="person" size={30} color="#A3A3FF" />
            <View className="flex ml-2">
              <Text className="text-white">Host</Text>
              <Text className="text-gray-200 font-semibold ">
                {host ? host.full_name : "Unknown Host"}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center mb-2">
            <Ionicons name="location" size={30} color="#A3A3FF" />
            <View className="flex ml-2">
              <Text className="text-white">Adresse</Text>
              <Text className="text-gray-200 font-semibold">
                {event?.location}
              </Text>
            </View>
          </View>
        </View>
        <LottieView
          source={require("@/../assets/time.json")}
          autoPlay
          loop
          style={{ width: 180, height: 200 }}
        />
      </View>
    </View>
  );
}
