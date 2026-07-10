import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import DataTable from '../components/DataTable.jsx'
import SkeletonRows from '../components/SkeletonRows.jsx'
import Pagination from '../components/Pagination.jsx'
import Toast from '../components/Toast.jsx'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers.js'

const EMPTY_FORM = { name: '', email: '', phone: '', address: '', category: '' }
const PAGE_SIZE = 10

export default function Customers() {
  const [customerList, setCustomerList] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null) // null = create mode, otherwise editing this customer's id
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)

  function loadCustomers(pageToLoad = page) {
    setLoading(true)
    getCustomers({ page: pageToLoad, pageSize: PAGE_SIZE })
      .then((result) => {
        setCustomerList(result.items)
        setTotalPages(result.totalPages)
        setTotalCount(result.totalCount)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCustomers(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customerList
    return customerList.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.category?.toLowerCase().includes(q)
    )
  }, [customerList, search])

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

  const openEditModal = (customer) => {
    setEditingId(customer.id)
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address ?? '',
      category: customer.category ?? '',
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
      // dto لازم يطابق Create/UpdateCustomerDto: { name, email, phone, address?, category }
      const dto = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address || undefined,
        category: form.category || 'عام',
      }
      if (editingId) {
        await updateCustomer(editingId, dto)
        setToast({ message: 'تم تعديل بيانات العميل بنجاح', tone: 'success' })
      } else {
        await createCustomer(dto)
        setToast({ message: 'تمت إضافة العميل بنجاح', tone: 'success' })
      }
      await loadCustomers(page)
      closeModal()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(`هل أنت متأكد من حذف "${customer.name}"؟`)
    if (!confirmed) return
    try {
      await deleteCustomer(customer.id)
      setToast({ message: 'تم حذف العميل بنجاح', tone: 'success' })
      await loadCustomers(page)
    } catch (err) {
      setToast({ message: err.message, tone: 'error' })
    }
  }

  const columns = [
    { key: 'id', header: 'الكود', render: (row) => <span className="mono">{row.id}</span> },
    { key: 'name', header: 'اسم العميل' },
    { key: 'email', header: 'البريد الإلكتروني', render: (row) => <span className="mono">{row.email}</span> },
    { key: 'phone', header: 'رقم الهاتف', render: (row) => <span className="mono">{row.phone}</span> },
    { key: 'address', header: 'العنوان', render: (row) => row.address ?? '—' },
    { key: 'category', header: 'الفئة' },
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
      title="العملاء"
      subtitle={loading ? 'جاري تحميل العملاء...' : `${totalCount} عميل مسجّل`}
    >
      {error && (
        <div style={{ color: 'var(--color-danger)', fontSize: 13.5 }}>
          تعذّر تحميل العملاء من الخادم: {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', minWidth: 240 }}>
          <Search size={15} style={{ position: 'absolute', insetInlineStart: 10, top: 10, color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="ابحث بالاسم أو البريد أو الهاتف..."
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
          إضافة عميل جديد
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
          <SkeletonRows columns={6} rows={PAGE_SIZE} />
        ) : (
          <DataTable columns={columns} rows={filteredCustomers} emptyText={search ? 'لا توجد نتائج مطابقة في هذه الصفحة' : undefined} />
        )}
        {!search && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>

      {isModalOpen && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px' }}>{editingId ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>

            {formError && (
              <div style={{ color: 'var(--color-danger)', fontSize: 13, marginBottom: 12 }}>{formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>اسم العميل</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>البريد الإلكتروني</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>رقم الهاتف</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>العنوان</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>الفئة</label>
                <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                  <option value="">اختر الفئة</option>
                  <option value="فردي">فردي</option>
                  <option value="شركة">شركة</option>
                  <option value="مؤسسة">مؤسسة</option>
                  <option value="حكومي">حكومي</option>
                  <option value="عام">عام</option>
                </select>
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
