'use client'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.12) 0%, #0a0a0f 60%)' }}>

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96
        rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 slide-in">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600
          flex items-center justify-center text-2xl font-black shadow-2xl shadow-violet-500/30 mb-6">
          R
        </div>

        <h1 className="text-4xl font-black tracking-tight mb-2">
          RESERVO<span className="text-violet-400">.AI</span>
        </h1>
        <p className="text-white/40 text-base mb-8 max-w-xs leading-relaxed">
          Tu recepcionista con IA, siempre disponible
        </p>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-10">
          {[
            { val: '+2.400', label: 'llamadas gestionadas' },
            { val: '98%', label: 'satisfacción' },
            { val: '24/7', label: 'disponibilidad' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-black text-violet-300">{s.val}</p>
              <p className="text-[11px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600
            text-sm font-bold shadow-lg shadow-violet-500/30
            hover:shadow-violet-500/50 hover:scale-[1.03]
            transition-all duration-200 active:scale-[0.98]">
          Entrar al panel →
        </button>

        <p className="text-[11px] text-white/20 mt-6">
          Horizon Studio · Cantabria, España
        </p>
      </div>
    </div>
  )
}
