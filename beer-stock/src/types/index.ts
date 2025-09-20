// types/index.ts
export interface Beer {
  id: string
  name: string
  type: string
  abv: number
  description: string
  availability_status: 'available' | 'limited' | 'out_of_stock' | 'discontinued'
  image_url?: string
  pricing: BeerPricing[]
}

export interface BeerPricing {
  id: string
  beer_id: string
  container_size: '50L' | '30L' | '20L' | 'flat'
  price: number
  stock_quantity: number
}

export interface Profile {
  id: string
  username: string
  company_name: string
  contact_email: string
  contact_phone?: string
  role: 'customer' | 'admin'
  is_active: boolean
}

export interface Location {
  id: string
  profile_id: string
  location_name: string
  address_line_1: string
  address_line_2?: string
  city: string
  province: string
  postal_code: string
  liquor_license_number: string
  liquor_license_expiry: Date
  delivery_instructions?: string
  is_primary: boolean
  is_active: boolean
}

export interface Order {
  id: string
  order_number: string
  profile_id: string
  location_id: string
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled'
  subtotal: number
  tax_amount: number
  total_amount: number
  notes?: string
  delivery_date?: Date
  created_at: Date
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  beer_id: string
  beer_name: string
  container_size: string
  quantity: number
  unit_price: number
  line_total: number
}
