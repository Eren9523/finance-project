import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockModels } from '../data/mock';
import { BankModel } from '../types';

interface FavoritesContextType {
  favorites: BankModel[];
  toggleFavorite: (modelId: string) => void;
  isFavorite: (modelId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<BankModel[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('user_favorites');
    if (stored) {
      try {
        const parsedIds = JSON.parse(stored) as string[];
        const loadedFavorites = parsedIds.map(id => mockModels.find(m => m.id === id)).filter(Boolean) as BankModel[];
        setFavorites(loadedFavorites);
      } catch (e) {
        console.error('Failed to parse favorites from local storage');
      }
    } else {
      // Mock initial data if nothing in storage
      const initialFavs = [mockModels[0], mockModels[1], mockModels[2]].filter(Boolean);
      setFavorites(initialFavs);
    }
  }, []);

  const toggleFavorite = (modelId: string) => {
    setFavorites(prev => {
      const isFav = prev.some(m => m.id === modelId);
      let newFavs;
      if (isFav) {
        newFavs = prev.filter(m => m.id !== modelId);
      } else {
        const modelToAdd = mockModels.find(m => m.id === modelId);
        newFavs = modelToAdd ? [...prev, modelToAdd] : prev;
      }
      
      localStorage.setItem('user_favorites', JSON.stringify(newFavs.map(m => m.id)));
      return newFavs;
    });
  };

  const isFavorite = (modelId: string) => {
    return favorites.some(m => m.id === modelId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
