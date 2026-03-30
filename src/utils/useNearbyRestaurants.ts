import { useQuery } from "@tanstack/react-query";
import { GeoapifyRestaurant } from "@/types";
import { enhanceRestaurants } from "./restaurantMeta";

const API_KEY = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function useNearbyRestaurants(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ["nearbyRestaurants", lat, lon],
    enabled: !!lat && !!lon,
    queryFn: async () => {
      const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},1000&limit=20&apiKey=${API_KEY}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Fehler beim Laden der Restaurants");

      const json = await res.json();
      const features: GeoapifyRestaurant[] = json.features ?? [];
      return enhanceRestaurants(features);
    },
  });
}
