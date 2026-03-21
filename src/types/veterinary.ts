export type PetSpecies = 'perro' | 'gato' | 'conejo' | 'ave' | 'reptil' | 'otro'

export type VetAppointmentType =
  | 'consulta'
  | 'vacuna'
  | 'revision'
  | 'urgencia'
  | 'cirugia'
  | 'peluqueria'

export interface Pet {
  id: string
  tenant_id: string
  owner_name: string
  owner_phone?: string
  name: string
  species: PetSpecies
  breed?: string
  age_approx?: string
  color?: string
  notes?: string
  active: boolean
  created_at: string
}

export interface VetAppointment {
  id: string
  tenant_id: string
  pet_name: string
  pet_species: PetSpecies
  owner_name: string
  owner_phone?: string
  vet_name?: string
  type: VetAppointmentType
  date: string
  time: string
  duration_minutes: 15 | 30 | 45 | 60 | 90
  reason?: string
  status: 'pendiente' | 'confirmada' | 'en_consulta' | 'completada' | 'cancelada'
  notes?: string
  created_at: string
}
