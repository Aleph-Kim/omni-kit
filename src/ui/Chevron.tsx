export function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 8 13"
      aria-hidden="true"
      // 아랍어 화면은 좌우 반전, 펼칠 때 반대로 회전해 아래 방향 유지
      className={`h-3 w-2 shrink-0 text-(--ok-label-3) transition-transform rtl:-scale-x-100 ${open ? 'rotate-90 rtl:-rotate-90' : ''}`}
    >
      <path d="M1.5 1.5 6.5 6.5 1.5 11.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
