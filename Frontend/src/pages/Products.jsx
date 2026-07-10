import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import DataTable from '../components/DataTable.jsx'
import Badge from '../components/Badge.jsx'
import SkeletonRows from '../components/SkeletonRows.jsx'
import Pagination from '../components/Pagination.jsx'
import Toast from '../components/Toast.jsx'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products.js'
import { getCategories } from '../api/categories.js'
import { getSuppliers } from '../api/suppliers.js'
import { formatCurrency } from '../utils/formatters.js'

const PAGE_SIZE = 10
const EMPTY_FORM = {
  name: '',
  sku: '',
  description: '',
  unitPrice: '',
  quantityInStock: '',
  reorderLevel: '10',
  categoryId: '',
  supplierId: '',
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  // مطلوبين لملء الـ dropdowns في فورم الإضافة/التعديل — CreateProductDto بياخد
  // categoryId/supplierId (أرقام)، مش أسماء نصية، فلازم نجيبهم من الـ API.
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  function loadProducts(pageToLoad = page) {
    setLoading(true)
    getProducts({ page: pageToLoad, pageSize: PAGE_SIZE })
      .then((result) => {
        setProducts(result.items)
        setTotalPages(result.totalPages)
        setTotalCount(result.totalCount)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
    getSuppliers().then(setSuppliers).catch(() => {})
  }, [])

  // البحث هنا بيفلتر بس داخل الصفحة المحمّلة حاليًا (10 صفوف)، مش عبر كل المنتجات.
  // ده قيد معروف — لازم الباك اند يضيف باراميتر بحث حقيقي (?search=) عشان يتحل صح.
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q) ||
        p.supplierName?.toLowerCase().includes(q)
    )
  }, [products, search])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description ?? '',
      unitPrice: String(product.unitPrice),
      quantityInStock: String(product.quantityInStock),
      reorderLevel: String(product.reorderLevel),
      categoryId: String(product.categoryId),
      supplierId: String(product.supplierId),
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormError(null)
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      // dto لازم يطابق Create/UpdateProductDto:
      // { name, sku, description?, unitPrice, quantityInStock, reorderLevel, categoryId, supplierId }
      const dto = {
        name: form.name,
        sku: form.sku,
        description: form.description || undefined,
        unitPrice: Number(form.unitPrice),
        quantityInStock: Number(form.quantityInStock),
        reorderLevel: Number(form.reorderLevel),
        categoryId: Number(form.categoryId),
        supplierId: Number(form.supplierId),
      }

      if (editingId) {
        await updateProduct(editingId, dto)
        setToast({ message: 'تم تعديل المنتج بنجاح', tone: 'success' })
      } else {
        await createProduct(dto)
        setToast({ message: 'تمت إضافة المنتج بنجاح', tone: 'success' })
      }
      await loadProducts(page)
      closeModal()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`هل أنت متأكد من حذف "${product.name}"؟`)
    if (!confirmed) return
    try {
      await deleteProduct(product.id)
      setToast({ message: 'تم حذف المنتج بنجاح', tone: 'success' })
      await loadProducts(page)
    } catch (err) {
      setToast({ message: err.message, tone: 'error' })
    }
  }

  const columns = [
    { key: 'sku', header: 'الكود', render: (row) => <span className="mono">{row.sku}</span> },
    { key: 'name', header: 'اسم المنتج' },
    { key: 'categoryName', header: 'الفئة', render: (row) => row.categoryName ?? '—' },
    { key: 'supplierName', header: 'المورد', render: (row) => row.supplierName ?? '—' },
    { key: 'quantityInStock', header: 'الكمية', render: (row) => <span className="mono">{row.quantityInStock}</span> },
    {
      key: 'status',
      header: 'الحالة',
      render: (row) => (row.isLowStock ? <Badge tone="danger">مخزون منخفض</Badge> : <Badge tone="success">متوفر</Badge>),
    },
    { key: 'unitPrice', header: 'سعر الوحدة', render: (row) => formatCurrency(row.unitPrice) },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => openEditModal(row)} title="تعديل" style={iconButtonStyle}>
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            title="حذف"
            style={{ ...iconButtonStyle, color: 'var(--color-danger)' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout
      title="المنتجات"
      subtitle={loading ? 'جاري تحميل المنتجات...' : `إجمالي ${totalCount} منتج مسجّل`}
    >
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
          تعذّر تحميل المنتجات من الخادم: {error}
          <br />
          تأكد إن مشروع Smart.WebApi شغال وإن رابط الـ API في ملف .env صحيح.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: 240 }}>
          <Search size={15} style={{ position: 'absolute', insetInlineStart: 10, top: 10, color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="ابحث في الصفحة الحالية (بالاسم أو الكود أو الفئة أو المورد)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 34px 8px 12px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              fontSize: 13.5,
            }}
          />
        </div>
        <button
          onClick={openCreateModal}
          disabled={categories.length === 0 || suppliers.length === 0}
          title={categories.length === 0 ? 'لازم تضيف فئة واحدة على الأقل الأول' : undefined}
          style={{ ...primaryButtonStyle, opacity: categories.length === 0 || suppliers.length === 0 ? 0.6 : 1 }}
        >
          <Plus size={16} />
          إضافة منتج جديد
        </button>
      </div>

      {(categories.length === 0 || suppliers.length === 0) && !loading && (
        <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
          محتاج تضيف فئة واحدة ومورد واحد على الأقل الأول من صفحة "الفئات" و"الموردين" قبل ما تقدر تضيف منتج.
        </div>
      )}

      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {loading ? (
          <SkeletonRows columns={7} rows={PAGE_SIZE} />
        ) : (
          <DataTable columns={columns} rows={filteredProducts} emptyText={search ? 'لا توجد نتائج مطابقة في هذه الصفحة' : undefined} />
        )}
        {!search && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>

      {isModalOpen && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>{editingId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>

            {formError && (
              <div style={{ color: 'var(--color-danger)', fontSize: 13, marginBottom: 12 }}>{formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>اسم المنتج</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>الكود (SKU)</label>
                  <input type="text" name="sku" value={form.sku} onChange={handleChange} required style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>الوصف (اختياري)</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>الفئة</label>
                  <select name="categoryId" value={form.categoryId} onChange={handleChange} required style={inputStyle}>
                    <option value="">اختر الفئة</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>المورد</label>
                  <select name="supplierId" value={form.supplierId} onChange={handleChange} required style={inputStyle}>
                    <option value="">اختر المورد</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>سعر الوحدة</label>
                  <input type="number" name="unitPrice" min="0" step="0.01" value={form.unitPrice} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>الكمية بالمخزون</label>
                  <input type="number" name="quantityInStock" min="0" value={form.quantityInStock} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>حد إعادة الطلب</label>
                  <input type="number" name="reorderLevel" min="0" value={form.reorderLevel} onChange={handleChange} required style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} style={secondaryButtonStyle}>
                  إلغاء
                </button>
                <button type="submit" disabled={submitting} style={{ ...primaryButtonStyle, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </DashboardLayout>
  )
}

const iconButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  borderRadius: 6,
  border: '1px solid var(--color-border)',
  background: 'transparent',
  cursor: 'pointer',
  color: 'var(--color-text)',
}

const primaryButtonStyle = {
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
  cursor: 'pointer',
}

const secondaryButtonStyle = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: '1px solid var(--color-border)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '14px',
}

const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: 600 }

const inputStyle = {
  width: '100%',
  padding: '8px',
  borderRadius: '6px',
  border: '1px solid var(--color-border)',
  fontSize: '14px',
  fontFamily: 'inherit',
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
}

const modalStyle = {
  background: 'var(--color-surface)',
  padding: '30px',
  borderRadius: 'var(--radius-md)',
  width: '560px',
  maxWidth: '90%',
  boxShadow: 'var(--shadow-card)',
}
