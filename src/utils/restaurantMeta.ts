// src/utils/restaurantMeta.ts
import { RestaurantWithMeta, GeoapifyRestaurant } from "@/types";


function priceToLabel(priceLevel?: number): string {
  if (priceLevel == null) return "€€";
  if (priceLevel <= 1) return "€";
  if (priceLevel === 2) return "€€";
  if (priceLevel === 3) return "€€€";
  return "€€€€";
}

function priceToCalories(priceLevel?: number): string {
  // Nur grobe Platzhalter-Logik
  if (priceLevel == null || priceLevel <= 1) return "500–800 kcal / Mahlzeit";
  if (priceLevel === 2) return "700–1000 kcal / Mahlzeit";
  if (priceLevel === 3) return "900–1300 kcal / Mahlzeit";
  return "1200–1600 kcal / Mahlzeit";
}

function ratingToLabel(rating?: number): string {
  if (!rating) return "noch keine Bewertung";
  return `${rating.toFixed(1)} ★`;
}

export function enhanceRestaurants(
  items: GeoapifyRestaurant[]
): RestaurantWithMeta[] {
  return items.map((r) => ({
    ...r,
    meta: {
      caloriesEstimate: priceToCalories(r.properties.price_level),
      priceLabel: priceToLabel(r.properties.price_level),
      ratingLabel: ratingToLabel(r.properties.rating),
    },
  }));
}
