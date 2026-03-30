// src/hooks/useRestaurantDetails.ts
import { useQuery } from "@tanstack/react-query";

const API_KEY = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

export function useRestaurantDetails(placeId?: string) {
  return useQuery({
    queryKey: ["restaurantDetails", placeId],
    enabled: !!placeId,
    queryFn: async () => {
      const url = `https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(
        placeId!
      )}&apiKey=${API_KEY}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Fehler beim Laden der Details");
      return res.json();
    },
  });
}
