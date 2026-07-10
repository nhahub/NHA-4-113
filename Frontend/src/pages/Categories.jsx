import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import DataTable from '../components/DataTable.jsx'
import SkeletonRows from '../components/SkeletonRows.jsx'
import Toast from '../components/Toast.jsx'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories.js'

const EMPTY_FORM = { name: '', description: '' }

export default function Categories() {
  const [categoryList, setCategoryList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null) // null = create mode
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)

  function loadCategories() {
    setLoading(true)
    getCategories()
      .then(setCategoryList)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categoryList
    return categoryList.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
    )
  }, [categoryList, search])

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

  const openEditModal = (category) => {
    setEditingId(category.id)
    setForm({ name: category.name, description: category.description ?? '' })
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
      // dto لازم يطابق Create/UpdateCategoryDto: { name, description? }
      const dto = { name: form.name, description: form.description || undefined }
      if (editingId) {
        await updateCategory(editingId, dto)
        setToast({ message: 'تم تعديل الفئة بنجاح', tone: 'success' })
      } else {
        await createCategory(dto)
        setToast({ message: 'تمت إضافة الفئة بنجاح', tone: 'success' })
      }
      await loadCategories()
      closeModal()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (category) => {
    const confirmed = window.confirm(`هل أنت متأكد من حذف فئة "${category.name}"؟`)
    if (!confirmed) return
    try {
      await deleteCategory(category.id)
      setToast({ message: 'تم حذف الفئة بنجاح', tone: 'success' })
      await loadCategories()
    } catch (err) {
      // الباك اند بيرفض الحذف لو لسه فيه منتجات مرتبطة بالفئة دي
      setToast({ message: err.message, tone: 'error' })
    }
  }

  const columns = [
    { key: 'id', header: 'الكود', render: (row) => <span className="mono">{row.id}</span> },
    { key: 'name', header: 'اسم الفئة' },
    { key: 'description', header: 'الوصف', render: (row) => row.description || '—' },
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
      title="الفئات"
      subtitle={loading ? 'جاري تحميل الفئات...' : `${categoryList.length} فئة مسجّلة`}
    >
      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: 13.5 }}>
          تعذّر تحميل الفئات من الخادم: {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: 240 }}>
          <Search size={15} style={{ position: 'absolute', insetInlineStart: 10, top: 10, color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الوصف..."
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
          إضافة فئة جديدة
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
          <SkeletonRows columns={5} rows={5} />
        ) : (
          <DataTable columns={columns} rows={filteredCategories} emptyText={search ? 'لا توجد نتائج مطابقة' : undefined} />
        )}
      </div>

      {isModalOpen && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>{editingId ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</h3>

            {formError && (
              <div style={{ color: 'var(--color-danger)', fontSize: 13, marginBottom: 12 }}>{formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>اسم الفئة</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>الوصف (اختياري)</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
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
  width: '500px',
  maxWidth: '90%',
  boxShadow: 'var(--shadow-card)',
}
