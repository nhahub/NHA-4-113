import { useEffect, useState } from 'react'
import { Package, AlertTriangle, Boxes, Wallet } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import StatCard from '../components/StatCard.jsx'
import RackCapacityBar from '../components/RackCapacityBar.jsx'
import LowStockAlert from '../components/LowStockAlert.jsx'
import ActivityFeed from '../components/ActivityFeed.jsx'
import { getProducts } from '../api/products.js'
// warehouses, activityLog, والحركة الأسبوعية لسه مفيش لهم Entities في الباك اند
// (مفيش Warehouse ولا Order/Movement)، فبتفضل مؤقتًا من الـ mock data لحد ما تتضاف.
import { warehouses, activityLog, getWeeklyMovement } from '../data/mockData.js'
import { formatNumber, formatCurrency } from '../utils/formatters.js'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // الإحصائيات والتنبيهات دي بقت محسوبة من بيانات حقيقية جايه من الـ API
  const stats = {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.isLowStock).length,
    totalUnits: products.reduce((sum, p) => sum + p.quantityInStock, 0),
    totalValue: products.reduce((sum, p) => sum + p.quantityInStock * p.unitPrice, 0),
  }

  const lowStockProducts = products
    .filter((p) => p.isLowStock)
    .map((p) => ({ id: p.id, name: p.name, sku: p.sku, quantity: p.quantityInStock }))

  const movement = getWeeklyMovement() // بيانات وهمية مؤقتًا (مفيش تتبع حركة فعلي في الباك اند حاليًا)

  return (
    <DashboardLayout
      title="نظرة عامة"
      subtitle={loading ? 'جاري تحميل البيانات...' : 'ملخص حالة المخازن اليوم'}
    >
      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: 13.5 }}>
          تعذّر تحميل بيانات المنتجات من الخادم: {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon={Package} label="إجمالي المنتجات" value={formatNumber(stats.totalProducts)} hint="عبر جميع المخازن" />
        <StatCard icon={Boxes} label="إجمالي الوحدات" value={formatNumber(stats.totalUnits)} hint="قطعة في المخزون" />
        <StatCard icon={AlertTriangle} label="تنبيهات مخزون منخفض" value={formatNumber(stats.lowStock)} tone="danger" hint="تحتاج إعادة طلب" />
        <StatCard icon={Wallet} label="القيمة الإجمالية للمخزون" value={formatCurrency(stats.totalValue)} tone="accent" hint="بالجنيه المصري" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, alignItems: 'stretch' }}>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            padding: '18px 20px',
          }}
        >
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>حركة التوريد والصرف الأسبوعية</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={movement} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: 'Tajawal', fontSize: 13, borderRadius: 8, border: '1px solid var(--color-border)' }} />
              <Legend wrapperStyle={{ fontSize: 12.5 }} />
              <Bar dataKey="توريد" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="صرف" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            justifyContent: 'center',
          }}
        >
          <h3 style={{ fontSize: 15 }}>نسبة إشغال المخازن</h3>
          {warehouses.map((wh) => (
            <RackCapacityBar key={wh.id} label={wh.name} percent={wh.capacityUsed} />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <LowStockAlert products={lowStockProducts} />
        <ActivityFeed items={activityLog} />
      </div>
    </DashboardLayout>
  )
}
