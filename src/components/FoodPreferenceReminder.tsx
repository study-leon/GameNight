// src/components/FoodPreferenceReminder.tsx
import { View, Text, Pressable } from "react-native";
import { Events } from "@/types";
import { useFoodPreference } from "@/utils/useFoodPreference";

type Props = {
  event: Events | null;
  onOpenSelection: () => void; // z.B. Modal oder Screen mit Auswahl
};

function isEventWithinHours(eventDate: string | null, hours: number): boolean {
  if (!eventDate) return false;
  const eventTime = new Date(eventDate).getTime();
  const now = Date.now();
  const diffHours = (eventTime - now) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= hours;
}

export function FoodPreferenceReminder({ event, onOpenSelection }: Props) {
  const eventId = event?.id ?? null;
  const { preference } = useFoodPreference(eventId);

  const shouldShow =
    !!event &&
    isEventWithinHours(event.date_time, 24) && // z.B. 24h vorher
    !preference;

  if (!shouldShow) return null;

  return (
    <View className="mx-4 mb-3 p-4 rounded-2xl bg-[#1E293B]">
      <Text className="text-white font-bold text-base mb-1">
        Wähle deine Essensrichtung 🍕
      </Text>
      <Text className="text-gray-300 text-sm mb-3">
        Bald wird Fast-Food bestellt. Bitte wähle rechtzeitig deine
        Lieblingsessensrichtung (Italienisch, Griechisch, Türkisch usw.), damit
        der Host planen kann.
      </Text>
      <Pressable
        onPress={onOpenSelection}
        className="bg-[#6C63FF] rounded-xl py-2 items-center"
      >
        <Text className="text-white font-semibold">Essensrichtung wählen</Text>
      </Pressable>
    </View>
  );
}
