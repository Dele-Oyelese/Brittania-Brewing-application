import * as z from 'zod'

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  company_name: z.string().min(1, 'Company name is required'),
  contact_phone: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  company_name: z.string().min(1, 'Company name is required'),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().optional()
})

export const locationSchema = z.object({
  location_name: z.string().min(1, 'Location name is required'),
  address_line_1: z.string().min(1, 'Address is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postal_code: z.string().regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Invalid postal code'),
  liquor_license_number: z.string().min(1, 'Liquor license number is required'),
  liquor_license_expiry: z.string().min(1, 'Liquor license expiry is required'),
  delivery_instructions: z.string().optional(),
  is_primary: z.boolean().optional()
})

export const beerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  abv: z.number().min(0).max(100),
  description: z.string(),
  availability_status: z.enum(['available', 'limited', 'out_of_stock', 'discontinued']),
  image_url: z.string().url().optional().or(z.literal(''))
})

export const beerPricingSchema = z.object({
  '50L': z.object({
    price: z.number().min(0),
    stock: z.number().min(0).int()
  }),
  '30L': z.object({
    price: z.number().min(0),
    stock: z.number().min(0).int()
  }),
  '20L': z.object({
    price: z.number().min(0),
    stock: z.number().min(0).int()
  }),
  'flat': z.object({
    price: z.number().min(0),
    stock: z.number().min(0).int()
  })
})

export const orderSchema = z.object({
  location_id: z.string().uuid('Please select a delivery location'),
  delivery_date: z.string().optional(),
  notes: z.string().optional()
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type LocationInput = z.infer<typeof locationSchema>
export type BeerInput = z.infer<typeof beerSchema>
export type BeerPricingInput = z.infer<typeof beerPricingSchema>
export type OrderInput = z.infer<typeof orderSchema>
