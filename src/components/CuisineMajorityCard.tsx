// src/components/CuisineMajorityCard.tsx
import { View, Text } from "react-native";
import { useCuisineStats } from "@/utils/useCuisineStat";

type Props = {
  eventId: string | null;
};

export function CuisineMajorityCard({ eventId }: Props) {
  const { data: stats = [], isLoading } = useCuisineStats(eventId);

  if (!eventId) return null;

  if (isLoading) {
    return (
      <View className="mx-4 mb-3 p-4 rounded-2xl bg-[#0F172A]">
        <Text className="text-gray-300 text-sm">Lade Essenspräferenzen…</Text>
      </View>
    );
  }

  if (stats.length === 0) {
    return (
      <View className="mx-4 mb-3 p-4 rounded-2xl bg-[#0F172A]">
        <Text className="text-white font-bold text-base mb-1">
          Essensrichtung
        </Text>
        <Text className="text-gray-300 text-sm">
          Noch keine Wünsche vorhanden. Erinnere deine Spieler:innen, ihre
          Essensrichtung zu wählen.
        </Text>
      </View>
    );
  }

  const top = stats[0];

  return (
    <View className="mx-4 mb-3 p-4 rounded-2xl bg-[#0F172A]">
      <Text className="text-white font-bold text-base mb-1">
        Mehrheitlich gewünschte Essensrichtung 🍽️
      </Text>
      <Text className="text-[#C4B5FD] text-lg font-semibold mb-1">
        {top.cuisine}
      </Text>
      <Text className="text-gray-300 text-sm">
        {top.count} Spieler:innen haben {top.cuisine} gewählt.
      </Text>
      {stats.length > 1 && (
        <Text className="text-gray-400 text-xs mt-2">
          Weitere Optionen werden ebenfalls berücksichtigt.
        </Text>
      )}
    </View>
  );
}
