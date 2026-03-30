// src/providers/GameSelectionProvider.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type GameSelectionContextType = {
  selectedGameIds: string[];
  toggleGame: (id: string) => void;
  resetSelection: () => void;
};

const GameSelectionContext = createContext<GameSelectionContextType | null>(
  null
);

export function GameSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);

  const toggleGame = (id: string) => {
    setSelectedGameIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const resetSelection = () => setSelectedGameIds([]);

  return (
    <GameSelectionContext.Provider
      value={{ selectedGameIds, toggleGame, resetSelection }}
    >
      {children}
    </GameSelectionContext.Provider>
  );
}

export function useGameSelection() {
  const ctx = useContext(GameSelectionContext);
  if (!ctx) {
    throw new Error(
      "useGameSelection must be used within a GameSelectionProvider"
    );
  }
  return ctx;
}
