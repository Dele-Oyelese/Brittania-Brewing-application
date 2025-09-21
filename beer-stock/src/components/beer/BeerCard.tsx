// components/beer/BeerCard.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/lib/stores/cart'
import { Beer } from '@/types'
import { ShoppingCart } from 'lucide-react'

interface BeerCardProps {
  beer: Beer
  isAdmin?: boolean
}

export function BeerCard({ beer, isAdmin = false }: BeerCardProps) {
  const addToCart = useCartStore((state) => state.addItem)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'limited': return 'bg-yellow-500'
      case 'out_of_stock': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{beer.name}</CardTitle>
          <Badge className={getStatusColor(beer.availability_status)}>
            {beer.availability_status.replace('_', ' ')}
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          {beer.type} • {beer.abv}% ABV
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{beer.description}</p>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Pricing:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {beer.pricing?.map((price) => (
              <div key={price.id} className="flex justify-between">
                <span>{price.container_size}:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${price.price}</span>
                  {!isAdmin && price.stock_quantity > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addToCart(beer, price)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Stock Levels:
              {beer.pricing?.map((price) => (
                <div key={price.id} className="flex justify-between">
                  <span>{price.container_size}:</span>
                  <span>{price.stock_quantity} units</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
