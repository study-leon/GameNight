import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Background from "@/components/Background";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types";
import { useClerk } from "@clerk/clerk-expo";
import { se } from "date-fns/locale";

export default function HostSettingsLayout() {
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [locationText, setLocationText] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [loadingLocation, setLoadingLocation] = useState(false);
  const queryClient = useQueryClient();

  const supabase = useSupabase();
  const { user } = useClerk();

  const {
    data: hosts = [],
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      const { data, error } = await supabase.from("users").select("*");
      return data || [];
    },
  });

  const combineDateAndTime = (date: Date, time: Date) => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0, 0);
    return combined;
  };

  const createEvent = useMutation({
    mutationFn: async () => {
      const combinedDateTime = combineDateAndTime(date!, time!);
      const { data: event } = await supabase
        .from("events")
        .insert({
          date_time: combinedDateTime.toISOString(),
          host_id: selectedHost,
          location: locationText,
        })
        .select()
        .single()
        .throwOnError();

      return event;
    },
    onSuccess(event) {
      queryClient.invalidateQueries({
        queryKey: ["events"],
      });
      Alert.alert("Erfolg", "Das Event wurde erfolgreich erstellt.");
      console.log("Event created:", event);
    },
    onError(error) {
      console.log("Error creating event:", error);
      Alert.alert(
        "Fehler",
        "Das Event konnte nicht erstellt werden. Bitte versuche es erneut."
      );
    },
  });

  const handleRandomHost = () => {
    if (!hosts.length) return;
    const random = hosts[Math.floor(Math.random() * hosts.length)];
    setSelectedHost(random.id);
  };

  const onChangeDate = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "set" && selected) {
      setDate(selected);
    }
  };

  const onChangeTime = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (event.type === "set" && selected) {
      setTime(selected);
    }
  };

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString("de-AT") : "Datum auswählen";

  const formatTime = (t: Date | null) =>
    t
      ? t.toLocaleTimeString("de-AT", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Uhrzeit auswählen";

  const handleGetLocation = async () => {
    try {
      setLoadingLocation(true);

      // 1. Permission anfragen
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Berechtigung benötigt",
          "Bitte erlaube den Zugriff auf deinen Standort, um Restaurants in der Nähe anzeigen zu können."
        );
        return;
      }

      // 2. Position holen
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;
      setCoords({ lat: latitude, lon: longitude });

      // 3. Optional: Reverse Geocoding → Adresse
      const [addr] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addr) {
        const formatted =
          [addr.street, addr.postalCode, addr.city, addr.country]
            .filter(Boolean)
            .join(", ") || `Lat: ${latitude}, Lon: ${longitude}`;

        setLocationText(formatted);
      } else {
        setLocationText(`Lat: ${latitude}, Lon: ${longitude}`);
      }
    } catch (error) {
      console.log("Location error:", error);
      Alert.alert(
        "Fehler",
        "Standort konnte nicht ermittelt werden. Versuche es später erneut."
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSave = () => {
    createEvent.mutate();

    console.log(time, date);
  };

  return (
    <View className="flex-1 relative ">
      <Background />
      <ScrollView className="flex-1 relative mt-32  ">
        <ScrollView className="bg-transparent h-[80vh] px-4 mt-6  ">
          <Text className="text-2xl font-bold text-white mb-4">
            Host Settings
          </Text>

          {/* Datum & Zeit */}
          <View className="bg-[#1C1C24] rounded-2xl p-4 mb-4">
            <Text className="text-lg font-semibold text-white mb-3">
              Datum & Zeit
            </Text>

            <View className="mb-3">
              <Text className="text-sm text-gray-300 mb-1">Datum</Text>
              <Pressable
                className="flex-row items-center justify-between bg-[#2A2A36] rounded-xl px-3 py-3"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-white">{formatDate(date)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#A3A3FF" />
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={date ?? new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={onChangeDate}
                />
              )}
            </View>

            <View>
              <Text className="text-sm text-gray-300 mb-1">Uhrzeit</Text>
              <Pressable
                className="flex-row items-center justify-between bg-[#2A2A36] rounded-xl px-3 py-3"
                onPress={() => setShowTimePicker(true)}
              >
                <Text className="text-white">{formatTime(time)}</Text>
                <Ionicons name="time-outline" size={20} color="#A3A3FF" />
              </Pressable>

              {showTimePicker && (
                <DateTimePicker
                  value={time ?? new Date()}
                  mode="time"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={onChangeTime}
                />
              )}
            </View>
          </View>

          {/* Host Auswahl */}
          <View className="bg-[#1C1C24] rounded-2xl p-4 mb-4">
            <Text className="text-lg font-semibold text-white mb-3">Host</Text>

            <View className="mb-3">
              <Text className="text-sm text-gray-300 mb-1">Host auswählen</Text>

              <FlatList
                className="bg-[#2A2A36] rounded-xl gap-3 p-3"
                data={hosts}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedHost;

                  return (
                    <Pressable
                      onPress={() => setSelectedHost(item.id)}
                      className="mr-4 items-center"
                    >
                      {item.avatar_url ? (
                        <Image
                          source={{ uri: item.avatar_url }}
                          className={`w-14 h-14 rounded-full border-2 ${
                            isSelected ? "border-[#6C63FF]" : "border-gray-500"
                          }`}
                        />
                      ) : (
                        <View
                          className={`w-14 h-14 rounded-full justify-center items-center border-2 ${
                            isSelected ? "border-[#6C63FF]" : "border-gray-500"
                          } bg-gray-500`}
                        >
                          <Text className="text-white text-xl">
                            {item.full_name?.charAt(0)}
                          </Text>
                        </View>
                      )}

                      <Text
                        className={`text-center mt-1 ${
                          isSelected ? "text-[#6C63FF]" : "text-white"
                        }`}
                      >
                        {item.full_name}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>

            <Pressable
              onPress={handleRandomHost}
              className="mt-1 flex-row items-center justify-center bg-[#6C63FF] rounded-xl py-2"
            >
              <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">
                Zufälligen Host wählen
              </Text>
            </Pressable>
          </View>

          {/* Location */}
          <View className="bg-[#1C1C24] rounded-2xl p-4 mb-4">
            <Text className="text-lg font-semibold text-white mb-3">
              Location
            </Text>

            <Text className="text-sm text-gray-300 mb-1">Adresse / Ort</Text>
            <TextInput
              value={locationText}
              onChangeText={setLocationText}
              placeholder="z.B. Salzburg, Linzer Gasse 10"
              placeholderTextColor="#777788"
              className="bg-[#2A2A36] rounded-xl px-3 py-3 text-white mb-3"
            />

            <Pressable
              onPress={handleGetLocation}
              className="flex-row items-center justify-center bg-[#2A2A36] rounded-xl py-2"
            >
              <Ionicons name="location-outline" size={18} color="#A3A3FF" />
              <Text className="text-white ml-2">
                {loadingLocation
                  ? "Standort wird abgerufen..."
                  : "Aktuellen Standort verwenden"}
              </Text>
            </Pressable>
            {coords && (
              <Text className="text-gray-400 text-sm mt-2">
                📍 Lat: {coords.lat.toFixed(5)} | Lon: {coords.lon.toFixed(5)}
              </Text>
            )}
          </View>

          {/* Speichern Button */}
          <Pressable
            onPress={handleSave}
            className="mt-2 bg-[#6C63FF] rounded-2xl py-3 items-center mb-12"
          >
            <Text className="text-white font-semibold text-lg">
              Einstellungen speichern
            </Text>
          </Pressable>
        </ScrollView>
      </ScrollView>
    </View>
  );
}
