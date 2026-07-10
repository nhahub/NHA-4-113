import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'

export default function DashboardLayout({ title, subtitle, children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar title={title} subtitle={subtitle} />
        <main style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</main>
      </div>
    </div>
  )
}
