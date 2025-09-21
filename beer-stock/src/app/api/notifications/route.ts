import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { type, orderId } = await request.json()
    const supabase = createAdminClient()

    // Fetch order details
    const { data: order } = await supabase
      .from('orders')
      .select(`
        *,
        profile:profiles(*),
        location:locations(*),
        items:order_items(*, beer:beers(*))
      `)
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Send customer email
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: order.profile.contact_email,
      subject: `Order Confirmation - ${order.order_number}`,
      html: generateCustomerEmail(order)
    })

    // Send admin notification
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: process.env.ADMIN_EMAIL!,
      subject: `New Order - ${order.order_number}`,
      html: generateAdminEmail(order)
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function generateCustomerEmail(order: any) {
  return `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order!</p>
    <h2>Order #${order.order_number}</h2>
    <p>Total: ${order.total_amount}</p>
    <p>We'll notify you when your order is ready.</p>
  `
}

function generateAdminEmail(order: any) {
  return `
    <h1>New Order Received</h1>
    <h2>Order #${order.order_number}</h2>
    <p>Customer: ${order.profile.company_name}</p>
    <p>Total: ${order.total_amount}</p>
    <p>Items: ${order.items.length}</p>
  `
}
