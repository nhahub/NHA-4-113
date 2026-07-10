import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import DataTable from '../components/DataTable.jsx'
import SkeletonRows from '../components/SkeletonRows.jsx'
import Pagination from '../components/Pagination.jsx'
import Toast from '../components/Toast.jsx'
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliers.js'

const EMPTY_FORM = { name: '', category: '', phone: '', rating: 0 }
const PAGE_SIZE = 10

export default function Suppliers() {
  const [supplierList, setSupplierList] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null) // null = create mode, otherwise editing this supplier's id
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [toast, setToast] = useState(null) // { message, tone }

  // "الفئة" هنا نص حر بيتخزن مباشرة على المورد نفسه في الباك اند (مش كيان منفصل)،
  // فمفيش داعي نجيبها من الـ API — دي مجرد اقتراحات لتسهيل الإدخال.
  const [categories, setCategories] = useState(['مواد غذائية', 'معدات', 'خدمات', 'قطع غيار'])
  const [form, setForm] = useState(EMPTY_FORM)
  const [newCategory, setNewCategory] = useState('')

  function loadSuppliers(pageToLoad = page) {
    setLoading(true)
    getSuppliers({ page: pageToLoad, pageSize: PAGE_SIZE })
      .then((result) => {
        setSupplierList(result.items)
        setTotalPages(result.totalPages)
        setTotalCount(result.totalCount)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSuppliers(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const filteredSuppliers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return supplierList
    return supplierList.filter(
      (s) => s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q) || s.phone?.includes(q)
    )
  }, [supplierList, search])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'category' && value === 'other') {
      setForm((prev) => ({ ...prev, category: '' }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
      setForm((prev) => ({ ...prev, category: newCategory.trim() }))
      setNewCategory('')
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (supplier) => {
    setEditingId(supplier.id)
    setForm({
      name: supplier.name,
      category: supplier.category,
      phone: supplier.phone,
      rating: supplier.rating ?? 0,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormError(null)
    setNewCategory('')
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      if (editingId) {
        // dto لازم يطابق UpdateSupplierDto: { name, category, phone, email?, address?, rating }
        await updateSupplier(editingId, {
          name: form.name,
          category: form.category,
          phone: form.phone,
          rating: Number(form.rating) || 0,
        })
        setToast({ message: 'تم تعديل بيانات المورد بنجاح', tone: 'success' })
      } else {
        // dto لازم يطابق CreateSupplierDto: { name, category, phone, email?, address? }
        await createSupplier({ name: form.name, category: form.category, phone: form.phone })
        setToast({ message: 'تمت إضافة المورد بنجاح', tone: 'success' })
      }
      await loadSuppliers(page) // نعيد تحميل القائمة من السيرفر بدل ما نعدّل محليًا
      closeModal()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(`هل أنت متأكد من حذف "${supplier.name}"؟`)
    if (!confirmed) return
    try {
      await deleteSupplier(supplier.id)
      setToast({ message: 'تم حذف المورد بنجاح', tone: 'success' })
      await loadSuppliers(page)
    } catch (err) {
      // الباك اند بيرفض الحذف لو المورد لسه عنده منتجات مرتبطة به
      setToast({ message: err.message, tone: 'error' })
    }
  }

  const columns = [
    { key: 'id', header: 'الكود', render: (row) => <span className="mono">{row.id}</span> },
    { key: 'name', header: 'اسم المورد' },
    { key: 'category', header: 'الفئة الرئيسية' },
    { key: 'phone', header: 'رقم التواصل', render: (row) => <span className="mono">{row.phone}</span> },
    { key: 'productCount', header: 'عدد المنتجات', render: (row) => row.productCount ?? 0 },
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
      title="الموردين"
      subtitle={loading ? 'جاري تحميل الموردين...' : `${totalCount} مورد مسجّل`}
    >
      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: 13.5 }}>
          تعذّر تحميل الموردين من الخادم: {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: 240 }}>
          <Search size={15} style={{ position: 'absolute', insetInlineStart: 10, top: 10, color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الفئة أو رقم الهاتف..."
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
        <button onClick={openCreateModal} style={primaryButtonStyle}>
          <Plus size={16} />
          إضافة مورد جديد
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
        {loading ? (
          <SkeletonRows columns={5} rows={PAGE_SIZE} />
        ) : (
          <DataTable columns={columns} rows={filteredSuppliers} emptyText={search ? 'لا توجد نتائج مطابقة في هذه الصفحة' : undefined} />
        )}
        {!search && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>

      {isModalOpen && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>{editingId ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}</h3>

            {formError && (
              <div style={{ color: 'var(--color-danger)', fontSize: 13, marginBottom: 12 }}>{formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>اسم المورد</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>الفئة الرئيسية</label>
                <select name="category" value={form.category} onChange={handleChange} required style={inputStyle}>
                  <option value="">اختر الفئة</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="other">➕ إضافة فئة جديدة</option>
                </select>
              </div>

              {form.category === '' && (
                <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="أدخل اسم الفئة الجديدة"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button type="button" onClick={handleAddCategory} style={{ ...primaryButtonStyle, whiteSpace: 'nowrap' }}>
                    إضافة
                  </button>
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>رقم التواصل</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required style={inputStyle} />
              </div>

              {editingId && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>التقييم (0 - 5)</label>
                  <input
                    type="number"
                    name="rating"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              )}

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
  width: '500px',
  maxWidth: '90%',
  boxShadow: 'var(--shadow-card)',
}
