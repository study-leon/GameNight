// src/components/RestaurantCard.tsx
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RestaurantWithMeta } from "@/types";
import { parseCuisine } from "@/utils/formatCuisine";

type RestaurantCardProps = {
  restaurant: RestaurantWithMeta;
  onPress?: () => void;
  liked?: boolean;
  likeCount?: number;
  onToggleLike?: () => void;
};

export function RestaurantCard({
  restaurant,
  onPress,
  liked = false,
  likeCount = 0,
  onToggleLike,
}: RestaurantCardProps) {
  const props = restaurant.properties as any;

  const name: string = props.name ?? "Unbekanntes Lokal";
  const address: string = props.address_line2 ?? "";

  const cuisineTags = parseCuisine(props?.catering?.cuisine);
  const stars: string | null =
    props?.catering?.stars ?? props?.accommodation?.stars ?? null;

  const hasDelivery: boolean = props?.delivery === true;
  const hasTakeaway: boolean = props?.takeaway === true;

  return (
    <Pressable
      onPress={onPress}
      className="w-full rounded-2xl bg-[#1E1B2F] p-4 mb-3"
    >
      {/* Kopfzeile: Name + Like-Button */}
      <View className="flex-row justify-between items-center mb-1">
        <Text
          className="text-white text-lg font-bold flex-1 mr-2"
          numberOfLines={1}
        >
          {name}
        </Text>

        <Pressable onPress={onToggleLike} hitSlop={8}>
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-sm text-gray-300 mt-1">{likeCount}</Text>
            <Ionicons
              name={liked ? "thumbs-up" : "thumbs-up-outline"}
              size={22}
              color={liked ? "#22C55E" : "#9CA3AF"}
            />
          </View>
        </Pressable>
      </View>

      {/* Sterne falls vorhanden */}
      {stars && <Text className="text-yellow-300 text-xs mb-1">{stars} ★</Text>}

      {/* Essensrichtung als Badges – nur wenn bekannt */}
      {cuisineTags.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-2">
          {cuisineTags.map((tag) => (
            <View key={tag} className="px-2 py-1 rounded-full bg-[#3B82F633]">
              <Text className="text-xs text-blue-200">{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Adresse */}
      {address ? (
        <Text className="text-gray-300 text-xs mb-2" numberOfLines={1}>
          {address}
        </Text>
      ) : null}

      {/* Badges für Lieferung / Abholung */}
      <View className="flex-row gap-2 mt-1">
        {hasDelivery && (
          <View className="px-2 py-1 rounded-full bg-[#22C55E33]">
            <Text className="text-xs text-green-400">Lieferung</Text>
          </View>
        )}
        {hasTakeaway && (
          <View className="px-2 py-1 rounded-full bg-[#3B82F633]">
            <Text className="text-xs text-blue-400">Abholung</Text>
          </View>
        )}
        {!hasDelivery && !hasTakeaway && (
          <Text className="text-xs text-gray-500">
            Liefer-/Abholoptionen unbekannt
          </Text>
        )}
      </View>
    </Pressable>
  );
}
