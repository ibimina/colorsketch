import { create } from "zustand";
import { getFavorites, toggleFavorite } from "@/lib/actions";

interface FavoritesStore {
  favorites: string[];
  isLoading: boolean;
  loadFavorites: () => Promise<void>;
  toggle: (sketchId: string) => Promise<void>;
  isFavorite: (sketchId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()((set, get) => ({
  favorites: [],
  isLoading: false,

  loadFavorites: async () => {
    set({ isLoading: true });
    const favorites = await getFavorites();
    set({ favorites, isLoading: false });
  },

  toggle: async (sketchId: string) => {
    const { favorites } = get();
    const isFavorited = favorites.includes(sketchId);

    // Optimistic update
    if (isFavorited) {
      set({ favorites: favorites.filter((id) => id !== sketchId) });
    } else {
      set({ favorites: [...favorites, sketchId] });
    }

    // Server update
    const result = await toggleFavorite(sketchId, isFavorited);

    // Revert if failed
    if (result.error) {
      if (isFavorited) {
        set({ favorites: [...favorites, sketchId] });
      } else {
        set({ favorites: favorites.filter((id) => id !== sketchId) });
      }
    }
  },

  isFavorite: (sketchId: string) => {
    return get().favorites.includes(sketchId);
  },
}));
