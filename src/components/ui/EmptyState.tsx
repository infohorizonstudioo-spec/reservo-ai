export function EmptyState({
  icon, title, description, action,
}: {
  icon: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-4xl mb-3 opacity-60">{icon}</div>
      <p className="text-sm font-medium text-white/50">{title}</p>
      {description && (
        <p className="text-xs text-white/30 mt-1 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30
            text-violet-300 text-xs font-medium hover:bg-violet-500/30 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
