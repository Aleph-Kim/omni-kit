import type { ReactNode } from 'react'

export function SectionTitle({ id, children, action }: { id: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3 px-3 text-xs">
      <h2 id={id} className="text-(--ok-label-2)">
        {children}
      </h2>
      {action}
    </div>
  )
}
