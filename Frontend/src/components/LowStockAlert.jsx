import { AlertTriangle } from 'lucide-react'
import Badge from './Badge.jsx'

export default function LowStockAlert({ products }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: '1px solid var(--color-border)' }}>
        <AlertTriangle size={18} color="var(--color-danger)" />
        <h3 style={{ fontSize: 15 }}>منتجات وصلت للحد الأدنى</h3>
      </div>
      <div>
        {products.length === 0 && (
          <p style={{ padding: 18, fontSize: 13, color: 'var(--color-text-muted)' }}>لا توجد منتجات تحتاج لإعادة طلب حاليًا.</p>
        )}
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{p.sku}</div>
            </div>
            <Badge tone="danger">{p.quantity} متبقي</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
