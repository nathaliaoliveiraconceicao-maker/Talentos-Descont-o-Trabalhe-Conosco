'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'bancada10:favorites'

interface FavoritesContextValue {
  favoriteIds: string[]
  isFavorite: (productId: string) => boolean
  toggleFavorite: (productId: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setFavoriteIds(JSON.parse(raw))
    } catch {
      // ignora dado corrompido
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds))
  }, [favoriteIds, hydrated])

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }, [])

  const isFavorite = useCallback((productId: string) => favoriteIds.includes(productId), [favoriteIds])

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>{children}</FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites deve ser usado dentro de <FavoritesProvider>')
  return ctx
}
