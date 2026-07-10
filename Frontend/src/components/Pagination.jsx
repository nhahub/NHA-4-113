import { ChevronRight, ChevronLeft } from 'lucide-react'

// كنترول تنقل بسيط بين الصفحات. الصفحات بتتعد من 1 (مش من صفر).
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '14px 0' }}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{ ...navButtonStyle, opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'default' : 'pointer' }}
      >
        <ChevronRight size={16} />
      </button>

      <span style={{ fontSize: 13.5, color: 'var(--color-text-muted)' }}>
        صفحة {page} من {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{ ...navButtonStyle, opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'default' : 'pointer' }}
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  )
}

const navButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
}
