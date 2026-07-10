// تنبيه بسيط بيظهر لثواني بعد نجاح أي عملية (إضافة/تعديل/حذف) بدل ما المودال
// يقفل بصمت. مفيش أي مكتبة خارجية هنا، عشان منضيفش dependency لحاجة بسيطة كده.
import { useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function Toast({ message, tone = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!message) return null

  const isSuccess = tone === 'success'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        insetInlineEnd: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--color-surface)',
        border: `1px solid ${isSuccess ? 'var(--color-success)' : 'var(--color-danger)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        padding: '12px 18px',
        fontSize: 13.5,
        fontWeight: 600,
        color: isSuccess ? 'var(--color-success)' : 'var(--color-danger)',
        zIndex: 1200,
      }}
      role="status"
    >
      {isSuccess ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      {message}
    </div>
  )
}
