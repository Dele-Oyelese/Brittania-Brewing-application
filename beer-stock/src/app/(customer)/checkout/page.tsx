'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useCartStore } from '@/lib/stores/cart'
import { createClient } from '@/lib/supabase/client'
import { calculateTax, formatCurrency, generateOrderNumber, getContainerSizeDisplay } from '@/lib/utils'
import { orderSchema, type OrderInput } from '@/lib/validations'
import { Location } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, profile } = useAuth()
  const { items, clearCart, getTotalAmount } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const supabase = createClient()

  const subtotal = getTotalAmount()
  const tax = calculateTax(subtotal)
  const total = subtotal + tax

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
  })

  // Fetch locations on mount
  useState(() => {
    const fetchLocations = async () => {
      if (!user) return

      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('profile_id', user.id)
        .eq('is_active', true)

      if (data) {
        setLocations(data)
        // Set primary location as default
        const primary = data.find(l => l.is_primary)
        if (primary) {
          setValue('location_id', primary.id)
        }
      }
    }

    fetchLocations()
  })

  const onSubmit = async (data: OrderInput) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to place an order',
        variant: 'destructive',
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Your cart is empty',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      // Create order
      const orderData = {
        order_number: generateOrderNumber(),
        profile_id: user.id,
        location_id: data.location_id,
        status: 'pending',
        subtotal,
        tax_amount: tax,
        total_amount: total,
        notes: data.notes,
        delivery_date: data.delivery_date,
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        beer_id: item.beer.id,
        beer_name: item.beer.name,
        container_size: item.pricing.container_size,
        quantity: item.quantity,
        unit_price: item.pricing.price,
        line_total: item.pricing.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Update inventory
      for (const item of items) {
        await supabase.rpc('decrement_stock', {
          p_beer_id: item.beer.id,
          p_container_size: item.pricing.container_size,
          p_quantity: item.quantity
        })
      }

      // Clear cart and redirect
      clearCart()

      toast({
        title: 'Order placed successfully!',
        description: `Order #${order.order_number} has been submitted.`,
      })

      router.push(`/orders/${order.id}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to place order',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Your cart is empty</p>
            <Button className="mt-4" onClick={() => router.push('/catalog')}>
              Browse Catalog
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.beer.id}-${item.pricing.container_size}`}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.beer.name}</p>
                      <p className="text-sm text-gray-600">
                        {getContainerSizeDisplay(item.pricing.container_size)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.pricing.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Delivery Location</Label>
                  <Select
                    onValueChange={(value) => setValue('location_id', value)}
                    defaultValue={locations.find(l => l.is_primary)?.id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.location_name} - {location.address_line_1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location_id && (
                    <p className="text-sm text-red-500">{errors.location_id.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="delivery_date">Preferred Delivery Date (Optional)</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    {...register('delivery_date')}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Special instructions or notes..."
                    {...register('notes')}
                    rows={3}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Place Order'}
              </Button>

              <p className="text-sm text-gray-600 text-center">
                You will receive an email confirmation once your order is processed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
