import { NavLink } from 'react-router-dom'
import { LayoutGrid, Package, Tag, Boxes, ClipboardList, Truck, BarChart3, Warehouse ,User} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { to: '/', label: 'الرئيسية', icon: LayoutGrid, end: true },
  { to: '/products', label: 'المنتجات', icon: Package },
  { to: '/categories', label: 'الفئات', icon: Tag },
  { to: '/inventory', label: 'الجرد والمخزون', icon: Boxes },
  { to: '/orders', label: 'أوامر التوريد والصرف', icon: ClipboardList },
  { to: '/suppliers', label: 'الموردين', icon: Truck, adminOnly: true },
  { to: '/customers', label: 'المستهلكين', icon: User, adminOnly: true },
  { to: '/reports', label: 'التقارير', icon: BarChart3, adminOnly: true },
]

export default function Sidebar() {
  const { isAdmin } = useAuth()
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        background: 'var(--color-primary-dark)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 16px',
        gap: 28,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary-dark)',
          }}
        >
          <Warehouse size={20} strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#fff' }}>مخزن</div>
          <div style={{ fontSize: 11, color: '#9fb2c4' }}>نظام إدارة المخازن</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--color-primary-dark)' : '#d7dee5',
              background: isActive ? 'var(--color-accent)' : 'transparent',
              borderInlineStart: isActive ? '3px solid var(--color-accent-dark)' : '3px solid transparent',
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            <item.icon size={18} strokeWidth={2.2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

     
    </aside>
  )
}
