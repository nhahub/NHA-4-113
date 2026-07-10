// عنصر مميز: يمثل "رف" في المخزن — شرائح مقسّمة تمتلئ بنسبة الإشغال،
// بدل شريط تقدّم عادي. مستوحى من رفوف التخزين المقسّمة.
export default function RackCapacityBar({ label, percent, segments = 12 }) {
  const filledSegments = Math.round((percent / 100) * segments)
  const tone = percent >= 90 ? 'var(--color-danger)' : percent >= 70 ? 'var(--color-accent)' : 'var(--color-success)'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{label}</span>
        <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: tone }}>
          {percent}%
        </span>
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 14,
              borderRadius: 2,
              background: i < filledSegments ? tone : 'var(--color-surface-alt)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
