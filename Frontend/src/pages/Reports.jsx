import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { getCategoryBreakdown, getReportSummary } from '../api/reports.js'
import { formatCurrency, formatNumber } from '../utils/formatters.js'

const COLORS = ['#24425f', '#3d6690', '#e2a63b', '#4c7a5d', '#b5462f']

export default function Reports() {
    const [breakdown, setBreakdown] = useState([])
    const [stats, setStats] = useState({ totalProducts: 0, totalUnits: 0, lowStock: 0, totalValue: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        setLoading(true)
        Promise.all([getCategoryBreakdown(), getReportSummary()])
            .then(([breakdownResult, statsResult]) => {
                setBreakdown(breakdownResult)
                setStats(statsResult)
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    return (
        <DashboardLayout title="التقارير" subtitle="نظرة تحليلية على توزيع المخزون">
            {error && (
                <div
                    style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-danger)',
                        color: 'var(--color-danger)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px 18px',
                        fontSize: 13.5,
                    }}
                >
                    تعذّر تحميل التقارير من الخادم: {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div
                    style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-card)',
                        padding: '18px 20px',
                    }}
                >
                    <h3 style={{ fontSize: 15, marginBottom: 16 }}>توزيع الوحدات حسب الفئة</h3>
                    {loading ? (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>جاري التحميل...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                                    {breakdown.map((entry, index) => (
                                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ fontFamily: 'Tajawal', fontSize: 13, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                                <Legend wrapperStyle={{ fontSize: 12.5 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
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
                        gap: 16,
                    }}
                >
                    <h3 style={{ fontSize: 15 }}>ملخص سريع</h3>
                    <SummaryRow label="إجمالي المنتجات" value={formatNumber(stats.totalProducts)} />
                    <SummaryRow label="إجمالي الوحدات المخزنة" value={formatNumber(stats.totalUnits)} />
                    <SummaryRow label="منتجات تحتاج إعادة طلب" value={formatNumber(stats.lowStock)} />
                    <SummaryRow label="القيمة الإجمالية للمخزون" value={formatCurrency(stats.totalValue)} />
                </div>
            </div>
        </DashboardLayout>
    )
}

function SummaryRow({ label, value }) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid var(--color-border)',
            }}
        >
            <span style={{ fontSize: 13.5, color: 'var(--color-text-muted)' }}>{label}</span>
            <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                {value}
            </span>
        </div>
    )
}