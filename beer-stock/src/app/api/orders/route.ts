// app/api/orders/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orderData = await request.json()

  // Generate order number
  const orderNumber = `BB-${Date.now().toString(36).toUpperCase()}`

  // Begin transaction
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      profile_id: user.id,
      ...orderData
    })
    .select()
    .single()

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 400 })
  }

  // Insert order items
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(
      orderData.items.map((item: any) => ({
        order_id: order.id,
        ...item
      }))
    )

  // Update inventory
  for (const item of orderData.items) {
    await supabase
      .from('beer_pricing')
      .update({
        stock_quantity: supabase.raw('stock_quantity - ?', [item.quantity])
      })
      .eq('beer_id', item.beer_id)
      .eq('container_size', item.container_size)
  }

  // Trigger email notifications
  await supabase.functions.invoke('send-order-notification', {
    body: { orderId: order.id, type: 'customer' }
  })

  await supabase.functions.invoke('send-order-notification', {
    body: { orderId: order.id, type: 'admin' }
  })

  return NextResponse.json({ order })
}
