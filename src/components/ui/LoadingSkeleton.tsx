export function LoadingSkeleton({
  lines = 5, type = 'list',
}: {
  lines?: number
  type?: 'list' | 'card' | 'table'
}) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-px">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5" style={{ opacity: 1 - i * 0.15 }}>
          <div className="skeleton h-3.5 w-10 rounded shrink-0" />
          <div className="skeleton h-3.5 flex-1 rounded" />
          <div className="skeleton h-5 w-16 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  )
}
