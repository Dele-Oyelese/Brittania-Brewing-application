// components/admin/InventoryManager.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const beerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  abv: z.number().min(0).max(100),
  description: z.string(),
  availability_status: z.enum(['available', 'limited', 'out_of_stock', 'discontinued']),
  pricing: z.object({
    '50L': z.number().min(0),
    '30L': z.number().min(0),
    '20L': z.number().min(0),
    'flat': z.number().min(0),
  }),
  stock: z.object({
    '50L': z.number().min(0),
    '30L': z.number().min(0),
    '20L': z.number().min(0),
    'flat': z.number().min(0),
  })
})

type BeerFormData = z.infer<typeof beerSchema>

export function InventoryManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BeerFormData>({
    resolver: zodResolver(beerSchema)
  })

  const onSubmit = async (data: BeerFormData) => {
    setIsLoading(true)

    try {
      // Insert beer
      const { data: beer, error: beerError } = await supabase
        .from('beers')
        .insert({
          name: data.name,
          type: data.type,
          abv: data.abv,
          description: data.description,
          availability_status: data.availability_status
        })
        .select()
        .single()

      if (beerError) throw beerError

      // Insert pricing
      const pricingData = Object.entries(data.pricing).map(([size, price]) => ({
        beer_id: beer.id,
        container_size: size,
        price: price,
        stock_quantity: data.stock[size as keyof typeof data.stock]
      }))

      const { error: pricingError } = await supabase
        .from('beer_pricing')
        .insert(pricingData)

      if (pricingError) throw pricingError

      toast({
        title: "Success",
        description: "Beer added to inventory successfully"
      })

      reset()
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add beer to inventory",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add New Beer</Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Beer to Inventory</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Beer Name</label>
                <Input {...register('name')} />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Type</label>
                <Input {...register('type')} placeholder="IPA, Lager, Stout, etc." />
                {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">ABV (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  {...register('abv', { valueAsNumber: true })}
                />
                {errors.abv && <p className="text-red-500 text-xs">{errors.abv.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Availability Status</label>
                <Select {...register('availability_status')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea {...register('description')} rows={3} />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4">
                <h3 className="font-medium mb-2">Pricing & Stock</h3>
              </div>

              {['50L', '30L', '20L', 'flat'].map((size) => (
                <div key={size} className="space-y-2">
                  <label className="text-sm font-medium">{size}</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    {...register(`pricing.${size}` as any, { valueAsNumber: true })}
                  />
                  <Input
                    type="number"
                    placeholder="Stock"
                    {...register(`stock.${size}` as any, { valueAsNumber: true })}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Beer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
