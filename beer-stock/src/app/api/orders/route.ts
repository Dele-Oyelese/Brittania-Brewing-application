import { generateOrderNumber } from '@/lib/utils'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const orderData = await request.json()

    // Create order with transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: generateOrderNumber(),
        profile_id: user.id,
        ...orderData
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        orderData.items.map((item: any) => ({
          order_id: order.id,
          ...item
        }))
      )

    if (itemsError) throw itemsError

    // Trigger notification
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order_placed',
        orderId: order.id
      })
    })

    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('orders')
    .select(`
      *,
      location:locations(*),
      items:order_items(*, beer:beers(*))
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: orders, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ orders })
}
