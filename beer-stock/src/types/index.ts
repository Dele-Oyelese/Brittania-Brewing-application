export type UserRole = 'customer' | 'admin'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled'
export type AvailabilityStatus = 'available' | 'limited' | 'out_of_stock' | 'discontinued'
export type ContainerSize = '50L' | '30L' | '20L' | 'flat'

export interface Profile {
  id: string
  username: string
  company_name: string
  contact_email: string
  contact_phone?: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
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
  liquor_license_expiry: string
  delivery_instructions?: string
  is_primary: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Beer {
  id: string
  name: string
  type: string
  abv: number
  description: string
  availability_status: AvailabilityStatus
  image_url?: string
  created_at: string
  updated_at: string
  pricing?: BeerPricing[]
}

export interface BeerPricing {
  id: string
  beer_id: string
  container_size: ContainerSize
  price: number
  stock_quantity: number
}

export interface Order {
  id: string
  order_number: string
  profile_id: string
  location_id: string
  status: OrderStatus
  subtotal: number
  tax_amount: number
  total_amount: number
  notes?: string
  delivery_date?: string
  created_at: string
  updated_at: string
  profile?: Profile
  location?: Location
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  beer_id: string
  beer_name: string
  container_size: ContainerSize
  quantity: number
  unit_price: number
  line_total: number
  beer?: Beer
}

export interface CartItem {
  beer: Beer
  pricing: BeerPricing
  quantity: number
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name?: string
  record_id?: string
  old_values?: any
  new_values?: any
  created_at: string
}
