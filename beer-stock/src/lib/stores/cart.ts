import { Beer, BeerPricing, CartItem } from '@/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface CartStore {
  items: CartItem[]
  addItem: (beer: Beer, pricing: BeerPricing, quantity?: number) => void
  removeItem: (beerId: string, containerSize: string) => void
  updateQuantity: (beerId: string, containerSize: string, quantity: number) => void
  clearCart: () => void
  getTotalAmount: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (beer, pricing, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            item => item.beer.id === beer.id &&
              item.pricing.container_size === pricing.container_size
          )

          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.beer.id === beer.id &&
                  item.pricing.container_size === pricing.container_size
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }
          }

          return {
            items: [...state.items, { beer, pricing, quantity }]
          }
        })
      },

      removeItem: (beerId, containerSize) => {
        set((state) => ({
          items: state.items.filter(
            item => !(item.beer.id === beerId &&
              item.pricing.container_size === containerSize)
          )
        }))
      },

      updateQuantity: (beerId, containerSize, quantity) => {
        if (quantity <= 0) {
          get().removeItem(beerId, containerSize)
          return
        }

        set((state) => ({
          items: state.items.map(item =>
            item.beer.id === beerId &&
              item.pricing.container_size === containerSize
              ? { ...item, quantity }
              : item
          )
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotalAmount: () => {
        return get().items.reduce((total, item) =>
          total + (item.pricing.price * item.quantity), 0
        )
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      }
    }),
    {
      name: 'britannia-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items })
    }
  )
)
