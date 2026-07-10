// صفوف وهمية بتظهر مكان الجدول أثناء التحميل بدل نص "جاري التحميل..." الجامد.
// مفيش أي مكتبة إضافية — بس CSS animation بسيطة (pulse) معرّفة في index.css.
export default function SkeletonRows({ columns = 5, rows = 5 }) {
  return (
    <div style={{ padding: '6px 14px' }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
          {Array.from({ length: columns }).map((__, c) => (
            <div
              key={c}
              className="skeleton-block"
              style={{
                height: 14,
                borderRadius: 4,
                flex: c === 0 ? '0 0 60px' : 1,
                maxWidth: c === 0 ? 60 : 160,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
