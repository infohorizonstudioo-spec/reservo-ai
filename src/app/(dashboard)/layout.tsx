'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TenantContext, getTenantConfig, useTenant, useTenantType } from '@/lib/tenant-context'
import { getDemoTenant } from '@/lib/supabase'
import { Tenant } from '@/types'

function Sidebar() {
  const path = usePathname()
  const tenant = useTenant()
  const tenantType = useTenantType()
  const config = getTenantConfig(tenantType)
  const active = (href: string) => path === href || (href !== '/dashboard' && path.startsWith(href + '/'))

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-white/[0.015]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-black shadow-lg shadow-violet-500/25">
            R
          </div>
          <div>
            <p className="font-bold text-sm leading-none">{tenant?.name ?? 'Reservo.AI'}</p>
            <p className="text-[10px] text-white/30 mt-0.5">Panel · Pro</p>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {config.navItems.map(item => {
          const isActive = active(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group border
                ${isActive
                  ? 'bg-white/10 text-white border-white/[0.08] border-l-2 border-l-violet-400'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05] border-transparent'}`}>
              <span className={`text-base transition-all
                ${isActive ? 'text-violet-400' : 'text-white/25 group-hover:text-white/50'}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge === 'live' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              )}
            </Link>
          )
        })}
      </nav>
      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/70 truncate">Arturo</p>
            <p className="text-[10px] text-white/30">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)

  useEffect(() => {
    getDemoTenant().then(t => { if (t) setTenant(t) })
  }, [])

  return (
    <TenantContext.Provider value={tenant}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto page-enter">
          {children}
        </main>
      </div>
    </TenantContext.Provider>
  )
}
