'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pet, PetSpecies } from '@/types/veterinary'

const SPECIES_EMOJI: Record<PetSpecies, string> = {
  perro: '\u{1F436}',
  gato: '\u{1F431}',
  conejo: '\u{1F430}',
  ave: '\u{1F426}',
  reptil: '\u{1F98E}',
  otro: '\u{1F43E}',
}

function getMockPets(tenantId: string): Pet[] {
  return [
    { id: '1', tenant_id: tenantId, name: 'Rocky', species: 'perro', breed: 'Labrador', owner_name: 'Carlos Lopez', owner_phone: '+34 612 345 678', age_approx: '5 anos', color: 'Dorado', active: true, created_at: new Date().toISOString() },
    { id: '2', tenant_id: tenantId, name: 'Luna', species: 'gato', breed: 'Siames', owner_name: 'Maria Fernandez', owner_phone: '+34 623 456 789', age_approx: '3 anos', color: 'Crema', active: true, created_at: new Date().toISOString() },
    { id: '3', tenant_id: tenantId, name: 'Tobi', species: 'perro', breed: 'Pastor Aleman', owner_name: 'Juan Perez', owner_phone: '+34 634 567 890', age_approx: '7 anos', color: 'Negro y fuego', active: true, created_at: new Date().toISOString() },
    { id: '4', tenant_id: tenantId, name: 'Piolin', species: 'ave', breed: 'Canario', owner_name: 'Ana Rodriguez', owner_phone: '+34 645 678 901', age_approx: '2 anos', color: 'Amarillo', active: true, created_at: new Date().toISOString() },
    { id: '5', tenant_id: tenantId, name: 'Coco', species: 'conejo', breed: 'Belier', owner_name: 'Laura Sanchez', owner_phone: '+34 656 789 012', age_approx: '1 ano', color: 'Blanco y gris', active: true, created_at: new Date().toISOString() },
    { id: '6', tenant_id: tenantId, name: 'Max', species: 'perro', breed: 'Bulldog Frances', owner_name: 'Carlos Lopez', owner_phone: '+34 612 345 678', age_approx: '2 anos', color: 'Atigrado', active: true, created_at: new Date().toISOString() },
  ]
}

interface Owner {
  name: string
  phone?: string
  pets: Pet[]
}

export default function MascotasView({ tenantId }: { tenantId: string }) {
  const [pets, setPets] = useState<Pet[]>([])
  const [tab, setTab] = useState<'mascotas' | 'propietarios'>('mascotas')
  const [search, setSearch] = useState('')
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .order('name')

      if (error?.code === '42P01') {
        setUsingMock(true)
        setPets(getMockPets(tenantId))
      } else {
        setUsingMock(false)
        setPets((data as Pet[]) || [])
      }
    }
    load()
  }, [tenantId])

  const owners: Owner[] = Object.values(
    pets.reduce<Record<string, Owner>>((acc, pet) => {
      const key = pet.owner_name.toLowerCase()
      if (!acc[key]) acc[key] = { name: pet.owner_name, phone: pet.owner_phone, pets: [] }
      acc[key].pets.push(pet)
      return acc
    }, {})
  )

  const filteredPets = pets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    p.breed?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredOwners = owners.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.phone?.includes(search) ||
    o.pets.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mascotas</h1>
          <p className="text-white/40 text-sm">
            {pets.length} mascota{pets.length !== 1 ? 's' : ''} &middot; {owners.length} propietario{owners.length !== 1 ? 's' : ''}
            {usingMock && <span className="ml-2 text-amber-400/60">(datos demo)</span>}
          </p>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          {(['mascotas', 'propietarios'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t ? 'bg-white/12 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t === 'mascotas' ? 'Mascotas' : 'Propietarios'}
            </button>
          ))}
        </div>
        <input
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-xs glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 bg-transparent focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* Mascotas tab */}
      {tab === 'mascotas' && (
        filteredPets.length === 0 ? (
          <div className="glass rounded-2xl py-16 text-center text-white/25 text-sm">
            {pets.length === 0 ? 'Sin mascotas registradas' : 'Sin resultados'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPets.map(pet => (
              <div key={pet.id} className="glass rounded-2xl p-5 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{SPECIES_EMOJI[pet.species]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg">{pet.name}</p>
                    <p className="text-sm text-white/40">{pet.breed || pet.species}</p>
                    <p className="text-sm text-white/30 mt-1">{pet.owner_name}</p>
                    {pet.age_approx && <p className="text-xs text-white/20 mt-0.5">{pet.age_approx}{pet.color ? ` \u00b7 ${pet.color}` : ''}</p>}
                  </div>
                </div>
                <button className="mt-4 w-full rounded-xl py-2 text-xs font-medium bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 transition-colors border border-teal-500/20">
                  + Nueva cita
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Propietarios tab */}
      {tab === 'propietarios' && (
        filteredOwners.length === 0 ? (
          <div className="glass rounded-2xl py-16 text-center text-white/25 text-sm">
            Sin resultados
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
            {filteredOwners.map(owner => (
              <div key={owner.name} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-500/30 flex items-center justify-center text-sm font-bold text-teal-300">
                  {owner.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{owner.name}</p>
                  <p className="text-sm text-white/40">{owner.phone || 'Sin telefono'}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {owner.pets.map(p => (
                    <span key={p.id} className="glass rounded-lg px-2.5 py-1 text-xs flex items-center gap-1.5">
                      {SPECIES_EMOJI[p.species]} {p.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
