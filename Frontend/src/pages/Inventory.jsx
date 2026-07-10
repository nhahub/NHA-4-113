import { useEffect, useState } from 'react'
import { Plus, X, Warehouse as WarehouseIcon } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import RackCapacityBar from '../components/RackCapacityBar.jsx'
import DataTable from '../components/DataTable.jsx'
import { getWarehouses, createWarehouse } from '../api/warehouses.js'
import { getProducts, createProduct } from '../api/products.js'
import { getCategories } from '../api/categories.js'
import { getSuppliers } from '../api/suppliers.js'

const columns = [
    { key: 'sku', header: 'الكود', render: (row) => <span className="mono">{row.sku}</span> },
    { key: 'name', header: 'اسم المنتج' },
    { key: 'quantityInStock', header: 'الكمية الحالية', render: (row) => <span className="mono">{row.quantityInStock}</span> },
    { key: 'reorderLevel', header: 'حد إعادة الطلب', render: (row) => <span className="mono">{row.reorderLevel}</span> },
]

export default function Inventory() {
    const [warehouseList, setWarehouseList] = useState([])
    const [productList, setProductList] = useState([])
    const [categoryList, setCategoryList] = useState([])
    const [supplierList, setSupplierList] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [isWarehouseModalOpen, setWarehouseModalOpen] = useState(false)
    const [productModalWarehouseId, setProductModalWarehouseId] = useState(null) // null = مغلق

    function loadAll() {
        setLoading(true)
        return Promise.all([getWarehouses(), getProducts(), getCategories(), getSuppliers()])
            .then(([warehousesResult, productsResult, categoriesResult, suppliersResult]) => {
                setWarehouseList(warehousesResult)
                setProductList(productsResult)
                setCategoryList(categoriesResult)
                setSupplierList(suppliersResult)
                setError(null)
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadAll()
    }, [])

    async function handleAddWarehouse(dto) {
        try {
            await createWarehouse(dto)
            setWarehouseModalOpen(false)
            loadAll()
        } catch (err) {
            alert(err.message)
        }
    }

    async function handleAddProduct(dto) {
        try {
            await createProduct(dto)
            setProductModalWarehouseId(null)
            loadAll()
        } catch (err) {
            alert(err.message)
        }
    }

    return (
        <DashboardLayout title="الجرد والمخزون" subtitle="نسب الإشغال وتفاصيل المخزون لكل مخزن">
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
                    تعذّر تحميل بيانات المخازن من الخادم: {error}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => setWarehouseModalOpen(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--color-primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontSize: 13.5,
                        fontWeight: 700,
                    }}
                >
                    <Plus size={16} />
                    إضافة مخزن جديد
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>جاري التحميل...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                        {warehouseList.map((wh) => (
                            <div
                                key={wh.id}
                                style={{
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-card)',
                                    padding: '18px 20px',
                                }}
                            >
                                <RackCapacityBar label={wh.name} percent={wh.capacityUsed} />
                            </div>
                        ))}
                    </div>

                    {warehouseList.map((wh) => {
                        const items = productList.filter((p) => p.warehouseId === wh.id)
                        return (
                            <div key={wh.id}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        margin: '4px 2px 10px',
                                    }}
                                >
                                    <h3 style={{ fontSize: 15 }}>{wh.name}</h3>
                                    <button
                                        onClick={() => setProductModalWarehouseId(wh.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            background: 'var(--color-surface)',
                                            color: 'var(--color-primary)',
                                            border: '1px solid var(--color-primary)',
                                            borderRadius: 8,
                                            padding: '7px 12px',
                                            fontSize: 12.5,
                                            fontWeight: 700,
                                        }}
                                    >
                                        <Plus size={14} />
                                        إضافة منتج في هذا المخزن
                                    </button>
                                </div>
                                <div
                                    style={{
                                        background: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-card)',
                                    }}
                                >
                                    <DataTable columns={columns} rows={items} emptyText="لا توجد أصناف مسجّلة في هذا المخزن" />
                                </div>
                            </div>
                        )
                    })}
                </>
            )}

            {isWarehouseModalOpen && <AddWarehouseModal onClose={() => setWarehouseModalOpen(false)} onSubmit={handleAddWarehouse} />}

            {productModalWarehouseId && (
                <AddProductModal
                    warehouse={warehouseList.find((w) => w.id === productModalWarehouseId)}
                    categories={categoryList}
                    suppliers={supplierList}
                    onClose={() => setProductModalWarehouseId(null)}
                    onSubmit={handleAddProduct}
                />
            )}
        </DashboardLayout>
    )
}

/* ============================= المودالات ============================= */

function ModalShell({ title, onClose, children }) {
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(23, 43, 63, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                padding: 20,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    width: '100%',
                    maxWidth: 440,
                    boxShadow: '0 20px 50px rgba(23,43,63,0.25)',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--color-border)',
                    }}
                >
                    <h3 style={{ fontSize: 16 }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: 'none',
                            background: 'var(--color-surface-alt)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-text-muted)',
                        }}
                        aria-label="إغلاق"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
            </div>
        </div>
    )
}

function FormField({ label, children }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{label}</span>
            {children}
        </label>
    )
}

const inputStyle = {
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13.5,
    fontFamily: 'inherit',
    color: 'var(--color-text)',
    outline: 'none',
    width: '100%',
}

const primaryButtonStyle = {
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 13.5,
    fontWeight: 700,
    width: '100%',
}

function AddWarehouseModal({ onClose, onSubmit }) {
    const [name, setName] = useState('')
    const [capacityUsed, setCapacityUsed] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (!name.trim() || submitting) return

        setSubmitting(true)
        await onSubmit({
            name: name.trim(),
            capacityUsed: Math.min(100, Math.max(0, Number(capacityUsed) || 0)),
        })
        setSubmitting(false)
    }

    return (
        <ModalShell title="إضافة مخزن جديد" onClose={onClose}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FormField label="اسم المخزن">
                    <input
                        style={inputStyle}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: مخزن المنصورة"
                        autoFocus
                        required
                    />
                </FormField>

                <FormField label="نسبة الإشغال الحالية (%)">
                    <input
                        style={inputStyle}
                        type="number"
                        min="0"
                        max="100"
                        value={capacityUsed}
                        onChange={(e) => setCapacityUsed(e.target.value)}
                        placeholder="0"
                    />
                </FormField>

                <button
                    type="submit"
                    disabled={submitting}
                    style={{ ...primaryButtonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: submitting ? 0.7 : 1 }}
                >
                    <WarehouseIcon size={16} />
                    {submitting ? 'جارٍ الحفظ...' : 'حفظ المخزن'}
                </button>
            </form>
        </ModalShell>
    )
}

function AddProductModal({ warehouse, categories, suppliers, onClose, onSubmit }) {
    const [name, setName] = useState('')
    const [sku, setSku] = useState('')
    const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
    const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '')
    const [quantity, setQuantity] = useState('')
    const [reorderLevel, setReorderLevel] = useState('')
    const [unitPrice, setUnitPrice] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (!name.trim() || !sku.trim() || !categoryId || !supplierId || submitting) return

        setSubmitting(true)
        await onSubmit({
            name: name.trim(),
            sku: sku.trim(),
            description: '',
            categoryId: Number(categoryId),
            supplierId: Number(supplierId),
            warehouseId: warehouse.id,
            quantityInStock: Number(quantity) || 0,
            reorderLevel: Number(reorderLevel) || 0,
            unitPrice: Number(unitPrice) || 0,
        })
        setSubmitting(false)
    }

    return (
        <ModalShell title={`إضافة منتج — ${warehouse.name}`} onClose={onClose}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FormField label="اسم المنتج">
                    <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: طابعة نافثة للحبر" autoFocus required />
                </FormField>

                <FormField label="كود المنتج (SKU)">
                    <input style={inputStyle} className="mono" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="مثال: OFF-0812" required />
                </FormField>

                <FormField label="الفئة">
                    <select style={inputStyle} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="المورد">
                    <select style={inputStyle} value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                        {suppliers.map((sup) => (
                            <option key={sup.id} value={sup.id}>
                                {sup.name}
                            </option>
                        ))}
                    </select>
                </FormField>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="الكمية">
                        <input style={inputStyle} type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
                    </FormField>
                    <FormField label="حد إعادة الطلب">
                        <input style={inputStyle} type="number" min="0" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} placeholder="0" />
                    </FormField>
                </div>

                <FormField label="سعر الوحدة (ج.م)">
                    <input style={inputStyle} type="number" min="0" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0" />
                </FormField>

                <button
                    type="submit"
                    disabled={submitting}
                    style={{ ...primaryButtonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: submitting ? 0.7 : 1 }}
                >
                    <Plus size={16} />
                    {submitting ? 'جارٍ الحفظ...' : 'حفظ المنتج'}
                </button>
            </form>
        </ModalShell>
    )
}