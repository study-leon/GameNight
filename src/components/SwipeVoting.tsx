// src/components/SwipeVoting.tsx
import {
  View,
  Text,
  Dimensions,
  Pressable,
  Image,
  Animated,
  PanResponder,
} from "react-native";
import { useRef, useState, useEffect, useMemo } from "react";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { Games } from "@/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.15;
const SWIPE_OUT_DURATION = 250;

type Props = {
  data: Games[];
  onVote?: (game: Games, direction: "left" | "right") => void;
};

export default function SwipeVoting({ data, onVote }: Props) {
  // ✅ nur die IDs vergleichen, damit wir wissen, wann sich die Auswahl ändert
  const dataKey = useMemo(() => data.map((g) => g.id).join(","), [data]);

  // aktueller Index im data-Array
  const [currentIndex, setCurrentIndex] = useState(0);

  // wenn sich die Auswahl der Spiele ändert → wieder von vorne anfangen
  useEffect(() => {
    setCurrentIndex(0);
  }, [dataKey]);

  const position = useRef(new Animated.ValueXY()).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ["-20deg", "0deg", "20deg"],
  });

  const cardStyle = {
    transform: [...position.getTranslateTransform(), { rotate }],
  };

  const forceSwipe = (direction: "left" | "right") => {
    const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;

    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => handleSwipe(direction));
  };

  // 🔥 zentrale Funktion: Swipe + Vote
  const handleSwipe = (direction: "left" | "right") => {
    const swipedIndex = currentIndex; // IMMER der aktuelle Index
    const swipedCard = data[swipedIndex]; // IMMER die richtige Karte

    if (!swipedCard) return;

    // Vote weitergeben
    if (onVote) {
      onVote(swipedCard, direction);
    }

    // Animation nach links/rechts
    const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;

    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      // Position zurücksetzen
      position.setValue({ x: 0, y: 0 });
    });

    // Direkt nächste Karte aktivieren
    setCurrentIndex((prev) => prev + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5,
    }).start();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_event, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_event, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        handleSwipe("right");
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        handleSwipe("left");
      } else {
        resetPosition();
      }
    },
  });

  const currentCard = data[currentIndex];

  // ✅ Keine Karten mehr oder keine Daten → Empty State
  if (!currentCard) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl text-white mb-2 text-center">
          Keine Spiele zum Swipen ausgewählt.
        </Text>
        <Text className="text-sm text-gray-300 mb-4 text-center px-8">
          Wähle im oberen Bereich Spiele mit &quot;Add to voting&quot; aus.
        </Text>

        <Pressable
          onPress={() => {
            router.navigate("/games/gameAdd");
          }}
          className="px-4 py-2 bg-[#6C63FF] rounded-full"
        >
          <Text className="text-white font-semibold">
            Neues Spiel erstellen
          </Text>
        </Pressable>

        <LottieView
          source={require("@/../assets/Waiting.json")}
          autoPlay
          loop
          style={{ width: 200, height: 200, marginTop: 16 }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center">
      <View className="mb-3 flex-row gap-5">
        <Pressable
          onPress={() => {
            router.navigate("/games/gameAdd");
          }}
          className="px-4 py-2 bg-[#6C63FF] rounded-full mb-3"
        >
          <Text className="text-white font-semibold">
            Neues Spiel erstellen
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            router.navigate("/games/votestats");
          }}
          className="px-4 py-2 bg-[#6C63FF] rounded-full mb-3"
        >
          <Text className="text-white font-semibold">Voting-Statistik</Text>
        </Pressable>
      </View>
      <View
        className="bg-slate-600 w-[90%] rounded-2xl overflow-hidden relative"
        style={{ height: SCREEN_HEIGHT * 0.6 }}
      >
        {/* Swipe-Karte */}
        <Animated.View
          style={[
            cardStyle,
            { position: "absolute", width: "100%", height: "100%" },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Bild */}
          <View className="flex-1">
            <Image
              source={{
                uri:
                  currentCard.image_url ??
                  "https://images.unsplash.com/photo-1616574808712-5cf60f175073?q=80&w=917&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Text-Overlay */}
          <View className="absolute top-0 bg-black/60 w-full p-4">
            <Text className="text-white text-2xl font-bold" numberOfLines={1}>
              {currentCard.name}
            </Text>
            <Text className="text-white text-base mt-1" numberOfLines={3}>
              {currentCard.description}
            </Text>
          </View>
        </Animated.View>

        {/* Dislike */}
        <Pressable
          className="absolute bottom-0 left-0"
          onPress={() => forceSwipe("left")}
        >
          <LottieView
            source={require("@/../assets/dislike.json")}
            autoPlay
            loop={true}
            style={{ width: 100, height: 100 }}
          />
        </Pressable>

        {/* Like */}
        <Pressable
          className="absolute bottom-5 right-4 mb-2"
          onPress={() => forceSwipe("right")}
        >
          <LottieView
            source={require("@/../assets/heart.json")}
            autoPlay
            loop={true}
            style={{ width: 55, height: 55 }}
          />
        </Pressable>
      </View>
    </View>
  );
}
