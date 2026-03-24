'use client'
import { createContext, useContext } from 'react'
import { Tenant } from '@/types'

export type TenantType = 'restaurant' | 'clinic' | 'veterinary' | 'realestate' | 'ecommerce' | 'physiotherapy' | 'psychology' | 'other'

export interface NavItem {
  href: string
  icon: string
  label: string
  badge?: string
}

export interface UnitLabels {
  singular: string
  plural: string
}

export interface TenantConfig {
  navItems: NavItem[]
  primaryEntity: string
  defaultRoute: string
  accentColor: string
  unitLabels: UnitLabels
}

export const TenantContext = createContext<Tenant | null>(null)
export function useTenant() { return useContext(TenantContext) }

export function useTenantType(): TenantType {
  const tenant = useTenant()
  if (!tenant) return 'restaurant'
  const t = tenant.type as string
  if (t === 'clinic') return 'clinic'
  if (t === 'veterinary') return 'veterinary'
  if (t === 'realestate') return 'realestate'
  if (t === 'psychology') return 'psychology'
  return 'restaurant'
}

export function getTenantConfig(type: TenantType): TenantConfig {
  const configs: Record<TenantType, TenantConfig> = {
    restaurant: {
      primaryEntity: 'reserva',
      defaultRoute: '/dashboard',
      accentColor: 'violet',
      unitLabels: { singular: 'Mesa', plural: 'Mesas' },
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/reservas',  icon: '◻', label: 'Reservas' },
        { href: '/pedidos',   icon: '▤', label: 'Pedidos' },
        { href: '/mesas',     icon: '⊞', label: 'Mesas' },
        { href: '/clientes',  icon: '◉', label: 'Clientes' },
      ],
    },
    clinic: {
      primaryEntity: 'cita',
      defaultRoute: '/agenda',
      accentColor: 'blue',
      unitLabels: { singular: 'Consulta', plural: 'Consultas' },
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/agenda',    icon: '▦', label: 'Agenda' },
        { href: '/clientes',  icon: '◉', label: 'Pacientes' },
      ],
    },
    veterinary: {
      primaryEntity: 'cita',
      defaultRoute: '/agenda',
      accentColor: 'teal',
      unitLabels: { singular: 'Consulta', plural: 'Consultas' },
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/agenda',    icon: '▦', label: 'Agenda' },
        { href: '/clientes',  icon: '◉', label: 'Mascotas' },
      ],
    },
    realestate: {
      primaryEntity: 'lead',
      defaultRoute: '/clientes',
      accentColor: 'amber',
      unitLabels: { singular: 'Espacio', plural: 'Espacios' },
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/clientes',  icon: '◉', label: 'Leads' },
        { href: '/agenda',    icon: '▦', label: 'Visitas' },
      ],
    },
    psychology: {
      primaryEntity: 'sesión',
      defaultRoute: '/agenda',
      accentColor: 'slate',
      unitLabels: { singular: 'Sala', plural: 'Salas' },
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/agenda',    icon: '▦', label: 'Agenda' },
        { href: '/clientes',  icon: '◉', label: 'Pacientes' },
      ],
    },
    ecommerce: {
      primaryEntity: 'pedido',
      defaultRoute: '/pedidos',
      accentColor: 'violet',
      unitLabels: { singular: 'Mesa', plural: 'Mesas' },
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/pedidos',   icon: '▤', label: 'Pedidos' },
        { href: '/clientes',  icon: '◉', label: 'Clientes' },
      ],
    },
    physiotherapy: {
      primaryEntity: 'cita',
      defaultRoute: '/agenda',
      accentColor: 'blue',
      unitLabels: { singular: 'Camilla', plural: 'Camillas' },
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/agenda',    icon: '▦', label: 'Agenda' },
        { href: '/clientes',  icon: '◉', label: 'Pacientes' },
      ],
    },
    other: {
      primaryEntity: 'cliente',
      defaultRoute: '/dashboard',
      accentColor: 'violet',
      unitLabels: { singular: 'Sillón', plural: 'Sillones' },
      navItems: [
        { href: '/dashboard', icon: '◈', label: 'Dashboard' },
        { href: '/llamadas',  icon: '⬤', label: 'Llamadas', badge: 'live' },
        { href: '/clientes',  icon: '◉', label: 'Clientes' },
      ],
    },
  }
  return configs[type]
}
