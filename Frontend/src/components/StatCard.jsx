export default function StatCard({ icon: Icon, label, value, hint, tone = 'primary' }) {
  const toneColor = tone === 'danger' ? 'var(--color-danger)' : tone === 'accent' ? 'var(--color-accent-dark)' : 'var(--color-primary)'

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</span>
        {Icon && (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: tone === 'danger' ? 'var(--color-danger-bg)' : tone === 'accent' ? '#fbead0' : 'var(--color-surface-alt)',
              color: toneColor,
              flexShrink: 0,
            }}
          >
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
      </div>
      <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
        {value}
      </div>
      {hint && <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{hint}</span>}
    </div>
  )
}
