const toneStyles = {
  success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)' },
  danger: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)' },
  accent: { bg: '#fbead0', color: 'var(--color-accent-dark)' },
  muted: { bg: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' },
}

export default function Badge({ tone = 'muted', children }) {
  const style = toneStyles[tone] || toneStyles.muted
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
