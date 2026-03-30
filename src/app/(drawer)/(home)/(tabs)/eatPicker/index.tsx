// src/screens/RestaurantsTabsScreen.tsx
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import { useNearbyRestaurants } from "@/utils/useNearbyRestaurants";
import { useRestaurantDetails } from "@/utils/useRestaurantDetails";
import { RestaurantWithMeta } from "@/types";
import { RestaurantCard } from "@/components/RestaurantCard";
import Background from "@/components/Background";
import { parseCuisine } from "@/utils/formatCuisine";
import { useRestaurantLikes } from "@/utils/useRestaurantLikes";

type TabKey = "nearby" | "favorites";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const EIGHTY_VH = SCREEN_HEIGHT * 0.8;

export default function RestaurantsTabsScreen() {
  const [coords, setCoords] = React.useState<{ lat: number; lon: number }>();
  const [activeTab, setActiveTab] = React.useState<TabKey>("nearby");
  const [selected, setSelected] = React.useState<RestaurantWithMeta | null>(
    null
  );
  const [likedIds, setLikedIds] = React.useState<Set<string>>(new Set());

  // Standort holen
  React.useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setCoords({
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
      });
    })();
  }, []);

  const {
    data: restaurants = [],
    isLoading,
    error,
  } = useNearbyRestaurants(coords?.lat, coords?.lon);

  const { data: detailsData, isLoading: detailsLoading } = useRestaurantDetails(
    selected?.properties.place_id
  );

  // Hilfsfunktionen für Properties
  const getStars = (r?: RestaurantWithMeta | null) => {
    if (!r) return null;
    const props = r.properties as any;
    return props?.catering?.stars ?? props?.accommodation?.stars ?? null;
  };

  const getCuisineTagsFromRestaurant = (r?: RestaurantWithMeta | null) => {
    if (!r) return [];
    const props = r.properties as any;
    return parseCuisine(props?.catering?.cuisine);
  };

  const hasDelivery = (r?: RestaurantWithMeta | null) => {
    if (!r) return false;
    const props = r.properties as any;
    return props?.delivery === true;
  };

  const hasTakeaway = (r?: RestaurantWithMeta | null) => {
    if (!r) return false;
    const props = r.properties as any;
    return props?.takeaway === true;
  };

  const placeIds = React.useMemo(
    () => restaurants.map((r) => r.properties.place_id),
    [restaurants]
  );

  const {
    likedByUser,
    counts: likeCounts,
    isLoading: likesLoading,
    toggleLike,
  } = useRestaurantLikes(placeIds);

  const favoriteRestaurants = React.useMemo(() => {
    if (!restaurants.length) return [];

    // Kopie erstellen, damit wir das Original nicht mutieren
    const sorted = [...restaurants].sort((a, b) => {
      const pidA = a.properties.place_id;
      const pidB = b.properties.place_id;
      const countA = likeCounts[pidA] ?? 0;
      const countB = likeCounts[pidB] ?? 0;
      return countB - countA; // absteigend nach Likes
    });

    // Nur Restaurants mit mindestens 1 Like
    return sorted.filter((r) => (likeCounts[r.properties.place_id] ?? 0) > 0);
  }, [restaurants, likeCounts]);

  // Tabs UI

  const renderNearbyTab = () => {
    if (isLoading)
      return <Text className="text-gray-200 mt-2">Lade Restaurants...</Text>;
    if (error)
      return (
        <Text className="text-red-400 mt-2">
          Fehler beim Laden der Restaurants.
        </Text>
      );
    if (!restaurants.length)
      return (
        <Text className="text-gray-400 mt-2">
          Keine Restaurants in deiner Nähe gefunden.
        </Text>
      );

    return (
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.properties.place_id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => {
          const pid = item.properties.place_id;
          return (
            <RestaurantCard
              restaurant={item}
              onPress={() => setSelected(item)}
              liked={likedByUser.has(pid)}
              likeCount={likeCounts[pid] ?? 0}
              onToggleLike={() => toggleLike(item.properties.place_id)}
            />
          );
        }}
      />
    );
  };

  const renderFavoritesTab = () => {
    if (likesLoading) {
      return (
        <View className="mt-4">
          <Text className="text-gray-300">Lade Favoriten…</Text>
        </View>
      );
    }

    if (!favoriteRestaurants.length) {
      return (
        <View className="mt-4">
          <Text className="text-gray-300">
            Noch keine Likes vorhanden. Like ein paar Restaurants, um Favoriten
            zu sehen.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={favoriteRestaurants}
        keyExtractor={(item) => item.properties.place_id}
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
        renderItem={({ item }) => {
          const pid = item.properties.place_id;
          return (
            <RestaurantCard
              restaurant={item}
              onPress={() => setSelected(item)}
              liked={likedByUser.has(pid)}
              likeCount={likeCounts[pid] ?? 0}
              onToggleLike={() => toggleLike(pid)}
            />
          );
        }}
      />
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "nearby":
        return renderNearbyTab();
      case "favorites":
        return renderFavoritesTab();
    }
  };

  // Details aus Place Details API vorbereiten
  const detailsFeature = (detailsData as any)?.features?.[0];
  const detailsProps = detailsFeature?.properties ?? {};
  const openingHours = detailsProps.opening_hours as string | undefined;
  const website = detailsProps.website as string | undefined;
  const phone = detailsProps?.contact?.phone as string | undefined;
  const detailsCuisine =
    detailsProps?.catering?.cuisine ??
    detailsProps?.accommodation?.cuisine ??
    undefined;
  const detailsStars =
    detailsProps?.catering?.stars ??
    detailsProps?.accommodation?.stars ??
    undefined;

  return (
    <View className="flex-1 mt-32">
      <Background />
      <View style={{ height: EIGHTY_VH }} className=" px-4 pt-10 pb-4">
        <Text className="text-white text-2xl font-bold mb-1">
          Restaurants in deiner Nähe
        </Text>
        <Text className="text-gray-300 text-sm mb-4">
          Finde etwas zu essen und sieh Öffnungszeiten, Essensrichtung &
          Lieferoptionen.
        </Text>

        {/* Tabs Header */}
        <View className="flex-row mb-3 rounded-xl bg-black/20 overflow-hidden">
          {(["nearby", "favorites"] as TabKey[]).map((tab) => {
            const isActive = activeTab === tab;
            const label =
              tab === "nearby"
                ? "In der Nähe"
                : tab === "favorites"
                  ? "Favoriten"
                  : "";
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2 items-center ${
                  isActive ? "bg-[#6C63FF]" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isActive ? "text-white font-semibold" : "text-gray-300"
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {renderActiveTabContent()}

        {/* Modal für Details */}
        <Modal
          visible={!!selected}
          animationType="slide"
          transparent
          onRequestClose={() => setSelected(null)}
        >
          <View className="flex-1 bg-black/60 justify-end">
            <View className="max-h-[80%] bg-neutral-900 rounded-t-3xl p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white text-xl font-bold flex-1">
                  {selected?.properties.name}
                </Text>
                <Pressable onPress={() => setSelected(null)}>
                  <Text className="text-gray-400 text-lg">✕</Text>
                </Pressable>
              </View>

              <ScrollView>
                <Text className="text-gray-400 mb-3">
                  {selected?.properties.address_line2}
                </Text>

                {/* Basic Infos aus Search + Geoapify-Daten */}
                {selected && (
                  <View className="mb-3">
                    {getStars(selected) && (
                      <Text className="text-yellow-400">
                        {getStars(selected)} ★
                      </Text>
                    )}
                    <Text className="text-[#C4B5FD] mt-1">
                      Essensrichtung:{" "}
                      {getCuisineTagsFromRestaurant(selected!).join(", ")}
                    </Text>

                    <View className="flex-row gap-2 mt-2">
                      {hasDelivery(selected!) && (
                        <View className="px-2 py-1 rounded-full bg-[#22C55E33]">
                          <Text className="text-xs text-green-400">
                            Lieferung
                          </Text>
                        </View>
                      )}
                      {hasTakeaway(selected!) && (
                        <View className="px-2 py-1 rounded-full bg-[#3B82F633]">
                          <Text className="text-xs text-blue-400">
                            Abholung
                          </Text>
                        </View>
                      )}
                      {!hasDelivery(selected!) && !hasTakeaway(selected!) && (
                        <Text className="text-xs text-gray-500">
                          Liefer-/Abholoptionen unbekannt
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Details & Öffnungszeiten aus Place Details */}
                <View className="mt-2">
                  <Text className="text-white font-semibold mb-1">
                    Details & Öffnungszeiten
                  </Text>

                  {detailsLoading && <ActivityIndicator className="mt-2" />}

                  {!detailsLoading && detailsData && (
                    <View className="mt-1">
                      {detailsStars && (
                        <Text className="text-yellow-400 text-sm mb-1">
                          Einstufung: {detailsStars} ★
                        </Text>
                      )}
                      {openingHours && (
                        <Text className="text-gray-300 text-sm mb-1">
                          Öffnungszeiten: {openingHours}
                        </Text>
                      )}
                      {website && (
                        <Text className="text-blue-400 text-sm mb-1">
                          Website: {website}
                        </Text>
                      )}
                      {phone && (
                        <Text className="text-gray-300 text-sm mb-1">
                          Telefon: {phone}
                        </Text>
                      )}
                      {!openingHours &&
                        !website &&
                        !phone &&
                        !detailsCuisine && (
                          <Text className="text-gray-400 text-sm">
                            Keine zusätzlichen Details verfügbar.
                          </Text>
                        )}
                    </View>
                  )}

                  {!detailsLoading && !detailsData && (
                    <Text className="text-gray-400 text-sm mt-2">
                      Keine zusätzlichen Details verfügbar.
                    </Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
