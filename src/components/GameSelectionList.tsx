import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { GameCard, Games } from "@/types";
import { Ionicons } from "@expo/vector-icons";

type GameSelectionListProps = {
  games: Games[];
  selectedGameIds: string[];
  onToggleGame: (id: string) => void;
  onAddNewGame?: () => void;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;
const EIGHTY_VH = SCREEN_HEIGHT * 0.8;

export function GameSelectionList({
  games,
  selectedGameIds,
  onToggleGame,
  onAddNewGame,
}: GameSelectionListProps) {
  // ❌ noch keine Spiele vorhanden

  const [searchText, setSearchText] = React.useState("");

  if (!games || games.length === 0) {
    return (
      <View className=" p-4  pt-0 items-center justify-center bg-white rounded-2xl shadow-sm ">
        <Ionicons name="game-controller-outline" size={32} color="#6C63FF" />
        <Text className="mt-3 text-lg font-semibold text-[#2D1B69]">
          Keine Spiele zum swipen
        </Text>
        <Text className="text-gray-500 text-sm mt-1 text-center">
          Füge Spiele zu deiner Liste hinzu, damit deine Gruppe darüber
          abstimmen kann.
        </Text>

        {onAddNewGame && (
          <Pressable
            onPress={onAddNewGame}
            className="mt-4 px-5 py-2 rounded-full bg-[#6C63FF]"
          >
            <Text className="text-white font-semibold text-sm">
              Füge Spiele zum Swipen hinzu
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  // ✅ Spiele vorhanden
  return (
    <ScrollView className="mt-28" style={{ height: EIGHTY_VH }}>
      <View className="mb-6   px-3">
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Suche"
          className=" p-4 rounded-full bg-white"
        />
      </View>
      <FlatList
        data={games}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isSelected = selectedGameIds.includes(item.id);

          return (
            <View className="flex-row bg-[#1C1C24] rounded-2xl p-3 mb-3 shadow-sm">
              <View className="flex-col items-center">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1623522264952-8dff960ec8f2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  }}
                  className="w-16 h-16 rounded-xl mr-3 bg-gray-200"
                />

                <View className="flex-row flex-wrap mt-2 ">
                  {item.max_players && (
                    <View className="bg-[#2A2A36] rounded-full px-2 py-1 mr-2 mb-1">
                      <Text className="text-[10px] text-gray-200">
                        {item.min_players} bis {item.max_players} Spieler
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-[#6C63FF]">
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>
                  {item.description}
                </Text>

                {/* kleine Tags wie im Screenshot */}

                <Pressable
                  onPress={() => onToggleGame(item.id)}
                  className={`mt-3 px-4 py-1 rounded-full self-start border ${
                    isSelected
                      ? "bg-green-50 border-green-500"
                      : "bg-[#6C63FF] border-[#A3A3FF]"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? "text-green-700" : "text-white"
                    }`}
                  >
                    {isSelected ? "In voting" : "Add to voting"}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </ScrollView>
  );
}
