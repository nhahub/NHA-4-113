import { ArrowDownCircle, ArrowUpCircle, AlertCircle, RefreshCcw } from 'lucide-react'

const kindMap = {
  in: { icon: ArrowDownCircle, color: 'var(--color-success)' },
  out: { icon: ArrowUpCircle, color: 'var(--color-primary)' },
  alert: { icon: AlertCircle, color: 'var(--color-danger)' },
  update: { icon: RefreshCcw, color: 'var(--color-text-muted)' },
}

export default function ActivityFeed({ items }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        padding: '16px 18px',
      }}
    >
      <h3 style={{ fontSize: 15, marginBottom: 14 }}>آخر الحركات</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item) => {
          const { icon: Icon, color } = kindMap[item.kind] || kindMap.update
          return (
            <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13.5 }}>{item.text}</p>
                <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{item.time}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
