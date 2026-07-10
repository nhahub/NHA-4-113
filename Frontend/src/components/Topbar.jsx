import { Search, Bell, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ROLE_LABELS = {
  Admin: 'مدير',
  Staff: 'موظف',
}

export default function Topbar({ title, subtitle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.fullName || user?.username || '?').trim().slice(0, 2)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 28px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      <div>
        <h1 style={{ fontSize: 20 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--color-surface-alt)',
            borderRadius: 8,
            padding: '8px 12px',
            width: 240,
          }}
        >
          <Search size={16} color="var(--color-text-muted)" />
          <input
            placeholder="بحث سريع..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13,
              width: '100%',
              fontFamily: 'inherit',
              color: 'var(--color-text)',
            }}
          />
        </div>
        <button
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
          }}
          aria-label="الإشعارات"
        >
          <Bell size={17} />
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              className="mono"
              title={user.fullName || user.username}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text)' }}>
                {user.fullName || user.username}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {ROLE_LABELS[user.role] || user.role}
              </div>
            </div>
            <button
              onClick={handleLogout}
              aria-label="تسجيل الخروج"
              title="تسجيل الخروج"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                marginInlineStart: 4,
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
