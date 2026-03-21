'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ConsultationEvent, ClinicAppointment } from '@/types/clinic'

interface ClinicNotification {
  id: string
  type: 'consulta' | 'cita_confirmada' | 'urgencia'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export default function ClinicNotifications({ tenantId }: { tenantId: string }) {
  const [notifications, setNotifications] = useState<ClinicNotification[]>([])
  const [open, setOpen] = useState(false)

  const unread = notifications.filter(n => !n.read).length
  const hasUrgency = notifications.some(n => n.type === 'urgencia' && !n.read)

  useEffect(() => {
    const channel = supabase
      .channel(`clinic-notif-${tenantId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'consultation_events',
        filter: `tenant_id=eq.${tenantId}`,
      }, (payload) => {
        const ev = payload.new as ConsultationEvent
        setNotifications(prev => [{
          id: `ce-${ev.id}`,
          type: (ev.is_urgent ? 'urgencia' : 'consulta') as 'urgencia' | 'consulta',
          title: ev.is_urgent ? 'Urgencia detectada' : 'Nueva consulta',
          message: `${ev.patient_name || 'Paciente'} — ${ev.reason || ev.consult_type || 'consulta'}`,
          timestamp: ev.created_at,
          read: false,
        }, ...prev].slice(0, 20))
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'clinic_appointments',
        filter: `tenant_id=eq.${tenantId}`,
      }, (payload) => {
        const appt = payload.new as ClinicAppointment
        if (appt.status === 'confirmada') {
          setNotifications(prev => [{
            id: `ca-${appt.id}`,
            type: 'cita_confirmada' as ClinicNotification['type'],
            title: 'Cita confirmada',
            message: `${appt.patient_name} — ${appt.date} ${appt.time}`,
            timestamp: new Date().toISOString(),
            read: false,
          } as ClinicNotification, ...prev].slice(0, 20))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId])

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
          hasUrgency ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 text-white/50 hover:bg-white/10'
        }`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
            hasUrgency ? 'bg-red-500 text-white' : 'bg-violet-500 text-white'
          }`}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 glass rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-semibold">Notificaciones</p>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-violet-400 hover:text-violet-300">Marcar todas</button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
              {notifications.length === 0 ? (
                <p className="py-8 text-center text-xs text-white/20">Sin notificaciones</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                    className={`px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer ${!n.read ? 'bg-white/[0.02]' : ''}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.type === 'urgencia' ? 'bg-red-400 animate-ping' :
                        n.type === 'cita_confirmada' ? 'bg-emerald-400' :
                        'bg-violet-400'
                      }`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-medium ${n.type === 'urgencia' ? 'text-red-300' : ''}`}>{n.title}</p>
                        <p className="text-[11px] text-white/40 truncate">{n.message}</p>
                        <p className="text-[10px] text-white/20 mt-0.5">
                          {new Date(n.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
