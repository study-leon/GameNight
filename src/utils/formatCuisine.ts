// src/utils/formatCuisine.ts

// Map für bekannte Codes -> schöne Labels (kannst du erweitern)
const CUISINE_LABELS: Record<string, string> = {
  italian: "Italienisch",
  greek: "Griechisch",
  turkish: "Türkisch",
  mediterranean: "Mediterran",
  seafood: "Meeresfrüchte",
  fish: "Fisch",
  burger: "Burger",
  pizza: "Pizza",
  asian: "Asiatisch",
  chinese: "Chinesisch",
  japanese: "Japanisch",
  indian: "Indisch",
};

export function parseCuisine(raw: string | null | undefined): string[] {
  if (!raw) return [];

  return raw
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => {
      const lower = c.toLowerCase();
      if (CUISINE_LABELS[lower]) return CUISINE_LABELS[lower];

      // Fallback: Capitalize + Unterstriche entfernen
      return lower
        .replace(/_/g, " ")
        .replace(/^\w/, (ch) => ch.toUpperCase());
    });
}
