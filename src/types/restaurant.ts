export interface MenuItem {
  id: string
  tenant_id: string
  name: string
  description?: string
  price: number
  category: string
  available: boolean
  image_url?: string
  created_at: string
}

export interface Zone {
  id: string
  tenant_id: string
  name: string
  capacity: number
  active: boolean
}

export interface Shift {
  id: string
  tenant_id: string
  name: string
  start_time: string
  end_time: string
  days: number[]
  active: boolean
}
