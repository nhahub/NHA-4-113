import { Plus, ArrowDownToLine, ArrowUpFromLine, CreditCard, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import DataTable from '../components/DataTable.jsx'
import Badge from '../components/Badge.jsx'
import { getOrders, createOrder, createReturn, payOrder } from '../api/orders.js'
import { getProducts } from '../api/products.js'
import { getWarehouses } from '../api/warehouses.js'
import { statusTone } from '../utils/formatters.js'

function formatOrderDate(value) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default function Orders() {
    // State variables
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [orderType, setOrderType] = useState('')
    const [orderList, setOrderList] = useState([])
    const [productList, setProductList] = useState([])
    const [warehouseList, setWarehouseList] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [newOrder, setNewOrder] = useState({
        id: '',
        type: '',
        product: '',
        quantity: '',
        totalAmount: '',
        paidAmount: '',
        status: '',
        warehouse: '',
        date: '',
        originalOrderId: ''
    })
    const [paymentAmount, setPaymentAmount] = useState('')

    function loadAll() {
        setLoading(true)
        return Promise.all([getOrders(), getProducts(), getWarehouses()])
            .then(([ordersResult, productsResult, warehousesResult]) => {
                setOrderList(ordersResult)
                setProductList(productsResult)
                setWarehouseList(warehousesResult)
                setLoadError(null)
            })
            .catch((err) => setLoadError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadAll()
    }, [])

    const [returnData, setReturnData] = useState({
        originalOrderId: '',
        product: '',
        quantity: '',
        reason: '',
        returnAmount: '',
        refundAmount: '',
        finalTotal: '',
        status: 'غير مكتمل',
        warehouse: '',
        unitPrice: 0,
        totalPaid: 0,
        totalOrderAmount: 0,
        remainingDebt: 0,
        paidAmount: 0 // المبلغ المدفوع في أمر المرتجع
    })

    // Handle input change for new order
    const handleChange = (e) => {
        const { name, value } = e.target

        if (name === 'quantity') {
            const quantity = parseFloat(value) || 0
            const selectedProduct = productList.find(p => String(p.id) === String(newOrder.product))
            const unitPrice = selectedProduct ? selectedProduct.unitPrice : 0
            const totalAmount = quantity * unitPrice

            setNewOrder((prev) => ({
                ...prev,
                quantity: value,
                totalAmount: totalAmount.toFixed(2),
                paidAmount: '',
                status: 'غير مكتمل'
            }))
        } else if (name === 'paidAmount') {
            const paidAmount = parseFloat(value) || 0
            const totalAmount = parseFloat(newOrder.totalAmount) || 0
            const status = paidAmount >= totalAmount && totalAmount > 0 ? 'مكتمل' : 'غير مكتمل'

            setNewOrder((prev) => ({
                ...prev,
                paidAmount: value,
                status: status
            }))
        } else if (name === 'product') {
            const selectedProduct = productList.find(p => String(p.id) === String(value))
            const quantity = parseFloat(newOrder.quantity) || 0
            const unitPrice = selectedProduct ? selectedProduct.unitPrice : 0
            const totalAmount = quantity * unitPrice

            setNewOrder((prev) => ({
                ...prev,
                product: value,
                totalAmount: totalAmount.toFixed(2),
                paidAmount: '',
                status: 'غير مكتمل'
            }))
        } else {
            setNewOrder((prev) => ({ ...prev, [name]: value }))
        }
    }

    // Handle return input change
    const handleReturnChange = (e) => {
        const { name, value } = e.target

        if (name === 'originalOrderId') {
            const order = orderList.find(o => String(o.id) === String(value))
            if (order) {
                // حساب المتبقي على العميل (المبلغ الإجمالي - المدفوع)
                const remainingDebt = order.totalAmount - order.paidAmount

                setReturnData((prev) => ({
                    ...prev,
                    originalOrderId: value,
                    product: order.product,
                    warehouse: order.warehouse || '',
                    unitPrice: order.unitPrice || 0,
                    totalPaid: order.paidAmount || 0,
                    totalOrderAmount: order.totalAmount || 0,
                    remainingDebt: remainingDebt > 0 ? remainingDebt : 0,
                    quantity: '',
                    returnAmount: '',
                    refundAmount: '',
                    finalTotal: '',
                    paidAmount: 0
                }))
            } else {
                setReturnData((prev) => ({
                    ...prev,
                    originalOrderId: value,
                    product: '',
                    warehouse: '',
                    unitPrice: 0,
                    totalPaid: 0,
                    totalOrderAmount: 0,
                    remainingDebt: 0,
                    quantity: '',
                    returnAmount: '',
                    refundAmount: '',
                    finalTotal: '',
                    paidAmount: 0
                }))
            }
        } else if (name === 'quantity') {
            const quantity = parseFloat(value) || 0
            const returnAmount = quantity * returnData.unitPrice

            setReturnData((prev) => ({
                ...prev,
                quantity: value,
                returnAmount: returnAmount.toFixed(2)
            }))
        } else if (name === 'refundAmount') {
            const refund = parseFloat(value) || 0

            // حساب المبلغ المدفوع في أمر المرتجع
            let paidAmount = 0
            let status = 'غير مكتمل'
            let finalTotal = parseFloat(returnData.returnAmount) || 0

            if (refund > 0) {
                if (returnData.remainingDebt > 0) {
                    // العميل عليه فلوس
                    if (refund <= returnData.remainingDebt) {
                        // المبلغ أقل من أو يساوي المديونية - يخصم من المديونية
                        paidAmount = 0
                        finalTotal = parseFloat(returnData.returnAmount) || 0
                        status = 'غير مكتمل' // لسه مدفعش حاجة
                    } else {
                        // المبلغ أكبر من المديونية
                        const excessAmount = refund - returnData.remainingDebt
                        paidAmount = excessAmount // المبلغ الزائد يتحول لمدفوع
                        finalTotal = (parseFloat(returnData.returnAmount) || 0) - refund
                        status = paidAmount > 0 ? 'مكتمل' : 'غير مكتمل'
                    }
                } else {
                    // العميل مش مديون
                    paidAmount = refund
                    finalTotal = (parseFloat(returnData.returnAmount) || 0) - refund
                    status = paidAmount > 0 ? 'مكتمل' : 'غير مكتمل'
                }
            } else {
                // مفيش مبلغ مرتجع
                paidAmount = 0
                finalTotal = parseFloat(returnData.returnAmount) || 0
                status = 'غير مكتمل'
            }

            setReturnData((prev) => ({
                ...prev,
                refundAmount: refund.toFixed(2),
                paidAmount: paidAmount,
                finalTotal: finalTotal.toFixed(2),
                status: status
            }))
        } else {
            setReturnData((prev) => ({ ...prev, [name]: value }))
        }
    }

    // Open modal with specific type
    const openModal = (type) => {
        setOrderType(type)
        setNewOrder({
            id: '',
            type: type,
            product: '',
            quantity: '',
            totalAmount: '',
            paidAmount: '',
            status: 'غير مكتمل',
            warehouse: '',
            date: '',
            originalOrderId: ''
        })
        setIsModalOpen(true)
    }

    // Open return modal
    const openReturnModal = () => {
        setReturnData({
            originalOrderId: '',
            product: '',
            quantity: '',
            reason: '',
            returnAmount: '',
            refundAmount: '',
            finalTotal: '',
            status: 'غير مكتمل',
            warehouse: '',
            unitPrice: 0,
            totalPaid: 0,
            totalOrderAmount: 0,
            remainingDebt: 0,
            paidAmount: 0
        })
        setIsReturnModalOpen(true)
    }

    // Handle form submit for new order
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (submitting) return

        setSubmitting(true)
        try {
            await createOrder({
                type: newOrder.type,
                productId: Number(newOrder.product),
                warehouseId: newOrder.warehouse ? Number(newOrder.warehouse) : null,
                quantity: parseInt(newOrder.quantity) || 0,
                paidAmount: parseFloat(newOrder.paidAmount) || 0,
            })
            await loadAll()

            setNewOrder({
                id: '',
                type: '',
                product: '',
                quantity: '',
                totalAmount: '',
                paidAmount: '',
                status: '',
                warehouse: '',
                date: '',
                originalOrderId: ''
            })
            setOrderType('')
            setIsModalOpen(false)
        } catch (err) {
            alert(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    // Handle return submit - creates independent order
    const handleReturnSubmit = (e) => {
        e.preventDefault()

        const today = new Date()
        const formattedDate = today.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })

        const quantity = parseInt(returnData.quantity) || 0
        const returnAmount = parseFloat(returnData.returnAmount) || 0
        const refundAmount = parseFloat(returnData.refundAmount) || 0
        const paidAmount = returnData.paidAmount || 0
        const finalTotal = parseFloat(returnData.finalTotal) || 0

        // Create independent return order
        const returnOrder = {
            id: `RET-${Date.now()}`,
            type: 'مرتجع',
            product: returnData.product,
            quantity: quantity,
            unitPrice: returnData.unitPrice,
            totalAmount: -finalTotal, // سالب
            paidAmount: paidAmount, // المبلغ المدفوع للمرتجع
            remainingAmount: -finalTotal - paidAmount, // المتبقي = الإجمالي - المدفوع
            status: returnData.status,
            warehouse: returnData.warehouse,
            date: formattedDate,
            originalOrderId: returnData.originalOrderId,
            reason: returnData.reason,
            returnAmount: -returnAmount,
            refundAmount: refundAmount,
            deductedFromDebt: refundAmount > 0 && returnData.remainingDebt > 0 ? Math.min(refundAmount, returnData.remainingDebt) : 0,
            returns: []
        }

        // Add the return order to list
        setOrderList([returnOrder, ...orderList])

        // Reset and close
        setReturnData({
            originalOrderId: '',
            product: '',
            quantity: '',
            reason: '',
            returnAmount: '',
            refundAmount: '',
            finalTotal: '',
            status: 'غير مكتمل',
            warehouse: '',
            unitPrice: 0,
            totalPaid: 0,
            totalOrderAmount: 0,
            remainingDebt: 0,
            paidAmount: 0
        })
        setIsReturnModalOpen(false)
    }

    // Handle payment for remaining amount
    const handlePaymentSubmit = (e) => {
        e.preventDefault()
        const payment = parseFloat(paymentAmount) || 0

        if (payment <= 0) {
            alert('يرجى إدخال مبلغ صحيح')
            return
        }

        const updatedOrders = orderList.map(order => {
            if (order.id === selectedOrder.id) {
                const newPaidAmount = order.paidAmount + payment
                const newRemainingAmount = order.totalAmount - newPaidAmount
                const newStatus = newPaidAmount >= Math.abs(order.totalAmount) && order.totalAmount <= 0 ? 'مكتمل' : 'غير مكتمل'

                return {
                    ...order,
                    paidAmount: newPaidAmount,
                    remainingAmount: newRemainingAmount,
                    status: newStatus
                }
            }
            return order
        })

        setOrderList(updatedOrders)
        setIsPaymentModalOpen(false)
        setSelectedOrder(null)
        setPaymentAmount('')
    }

    // Open payment modal
    const openPaymentModal = (order) => {
        setSelectedOrder(order)
        setPaymentAmount('')
        setIsPaymentModalOpen(true)
    }

    const columns = [
        { key: 'id', header: 'رقم الأمر', render: (row) => <span className="mono">{row.id}</span> },
        {
            key: 'type',
            header: 'النوع',
            render: (row) => {
                if (row.type === 'مرتجع') {
                    return <Badge tone="danger">مرتجع</Badge>
                }
                return <Badge tone={row.type === 'توريد' ? 'success' : 'accent'}>{row.type}</Badge>
            },
        },
        { key: 'product', header: 'المنتج' },
        { key: 'quantity', header: 'الكمية', render: (row) => <span className="mono">{row.quantity}</span> },
        {
            key: 'totalAmount',
            header: 'المبلغ الإجمالي',
            render: (row) => (
                <span className="mono" style={{
                    color: row.totalAmount < 0 ? 'var(--color-danger)' : 'inherit',
                    fontWeight: row.totalAmount < 0 ? 'bold' : 'normal'
                }}>
                    {row.totalAmount?.toFixed(2) || '—'}
                </span>
            )
        },
        {
            key: 'paidAmount',
            header: 'المدفوع',
            render: (row) => <span className="mono">{row.paidAmount?.toFixed(2) || '—'}</span>
        },
        {
            key: 'remainingAmount',
            header: 'المتبقي',
            render: (row) => (
                <span className="mono" style={{
                    color: row.remainingAmount > 0 ? 'var(--color-danger)' :
                        row.remainingAmount < 0 ? 'var(--color-success)' : 'var(--color-primary)',
                    fontWeight: row.remainingAmount !== 0 ? 'bold' : 'normal'
                }}>
                    {row.remainingAmount?.toFixed(2) || '—'}
                </span>
            )
        },
        {
            key: 'refundAmount',
            header: 'مرتجع للعميل',
            render: (row) => {
                if (row.type === 'مرتجع' && row.refundAmount) {
                    return <span className="mono" style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                        {row.refundAmount.toFixed(2)}
                    </span>
                }
                return <span className="mono">—</span>
            }
        },
        { key: 'date', header: 'التاريخ', render: (row) => <span className="mono">{row.date}</span> },
        {
            key: 'status',
            header: 'الحالة',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Badge tone={
                        row.status === 'مكتمل' ? 'success' :
                            row.status === 'مستحق للعميل' ? 'info' :
                                row.status === 'مخصوم من المديونية' ? 'warning' :
                                    row.status === 'مستحق للعميل ومخصوم' ? 'accent' : 'warning'
                    }>
                        {row.status}
                    </Badge>

                    {row.status === 'غير مكتمل' && row.remainingAmount > 0 && row.type !== 'مرتجع' && (
                        <button
                            onClick={() => openPaymentModal(row)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'var(--color-primary)',
                                color: '#fff',
                                fontSize: '12px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <CreditCard size={14} />
                            سداد {row.remainingAmount.toFixed(2)}
                        </button>
                    )}

                    {row.status === 'غير مكتمل' && row.type === 'مرتجع' && row.remainingAmount < 0 && (
                        <button
                            onClick={() => openPaymentModal(row)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'var(--color-primary)',
                                color: '#fff',
                                fontSize: '12px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <CreditCard size={14} />
                            سداد {Math.abs(row.remainingAmount).toFixed(2)}
                        </button>
                    )}

                    {row.originalOrderId && (
                        <Badge tone="info" style={{ fontSize: '11px' }}>
                            مرتبط بـ: {row.originalOrderId}
                        </Badge>
                    )}
                    {row.type === 'مرتجع' && row.reason && (
                        <Badge tone="warning" style={{ fontSize: '11px' }}>
                            {row.reason}
                        </Badge>
                    )}
                </div>
            )
        },
    ]

    return (
        <DashboardLayout title="أوامر التوريد والصرف" subtitle={`${orderList.length} أمر مسجّل`}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                    onClick={() => openModal('توريد')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--color-success)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontSize: 13.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    <ArrowDownToLine size={16} />
                    توريد جديد
                </button>
                <button
                    onClick={() => openModal('صرف')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--color-accent)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontSize: 13.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    <ArrowUpFromLine size={16} />
                    صرف جديد
                </button>
                <button
                    onClick={openReturnModal}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--color-danger)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontSize: 13.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    <Undo2 size={16} />
                    مرتجع جديد
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
                <DataTable columns={columns} rows={orderList} />
            </div>

            {/* Modal for new order (توريد/صرف) */}
            {isModalOpen && (
                <div
                    style={{
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
                    }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        style={{
                            background: 'var(--color-surface)',
                            padding: '30px',
                            borderRadius: 'var(--radius-md)',
                            width: '500px',
                            maxWidth: '90%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: 'var(--shadow-card)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginBottom: '20px' }}>
                            {orderType === 'توريد' ? 'توريد جديد' : 'صرف جديد'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>المنتج</label>
                                <select
                                    name="product"
                                    value={newOrder.product}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">اختر المنتج</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.name}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>المخزن</label>
                                <select
                                    name="warehouse"
                                    value={newOrder.warehouse}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">اختر المخزن</option>
                                    {warehouses.map((warehouse) => (
                                        <option key={warehouse.id} value={warehouse.name}>
                                            {warehouse.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>الكمية</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={newOrder.quantity}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>المبلغ الإجمالي</label>
                                <input
                                    type="text"
                                    name="totalAmount"
                                    value={newOrder.totalAmount ? `${newOrder.totalAmount} جنيه` : '0.00 جنيه'}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '14px',
                                        backgroundColor: '#f5f5f5',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>المبلغ المدفوع</label>
                                <input
                                    type="number"
                                    name="paidAmount"
                                    value={newOrder.paidAmount}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="أدخل المبلغ المدفوع (اختياري)"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '14px'
                                    }}
                                />
                                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                                    اتركه فارغاً إذا لم يتم الدفع
                                </small>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>الحالة</label>
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '6px',
                                    backgroundColor: newOrder.status === 'مكتمل' ? '#d4edda' : '#fff3cd',
                                    color: newOrder.status === 'مكتمل' ? '#155724' : '#856404',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}>
                                    {newOrder.status || 'غير مكتمل'}
                                </div>
                                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                                    {newOrder.status === 'مكتمل' ? '✅ تم دفع المبلغ بالكامل' : '⚠️ المبلغ المدفوع أقل من الإجمالي'}
                                </small>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        setNewOrder({
                                            id: '',
                                            type: '',
                                            product: '',
                                            quantity: '',
                                            totalAmount: '',
                                            paidAmount: '',
                                            status: '',
                                            warehouse: '',
                                            date: '',
                                            originalOrderId: ''
                                        })
                                        setOrderType('')
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'var(--color-primary)',
                                        color: '#fff',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    إنشاء الأمر
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for return - independent order */}
            {isReturnModalOpen && (
                <div
                    style={{
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
                    }}
                    onClick={() => setIsReturnModalOpen(false)}
                >
                    <div
                        style={{
                            background: 'var(--color-surface)',
                            padding: '30px',
                            borderRadius: 'var(--radius-md)',
                            width: '550px',
                            maxWidth: '90%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: 'var(--shadow-card)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginBottom: '20px', color: 'var(--color-danger)' }}>مرتجع جديد</h3>
                        <form onSubmit={handleReturnSubmit}>
                            {/* رقم الأمر الأصلي */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                                    رقم الأمر الأصلي
                                </label>
                                <input
                                    type="text"
                                    name="originalOrderId"
                                    value={returnData.originalOrderId}
                                    onChange={handleReturnChange}
                                    required
                                    placeholder="أدخل رقم الأمر (مثال: ORD-123456789)"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '14px'
                                    }}
                                />
                                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                                    سيتم جلب بيانات المنتج فقط للرجوع إليها
                                </small>
                            </div>

                            {/* عرض بيانات العميل */}
                            {returnData.originalOrderId && returnData.product && (
                                <div style={{
                                    marginBottom: '16px',
                                    padding: '12px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '6px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>المنتج:</strong> {returnData.product}
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>سعر الوحدة:</strong> {returnData.unitPrice} جنيه
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>المخزن:</strong> {returnData.warehouse || '—'}
                                    </p>
                                    <p style={{
                                        margin: '4px 0',
                                        color: returnData.remainingDebt > 0 ? 'var(--color-danger)' : 'var(--color-success)',
                                        fontWeight: 'bold'
                                    }}>
                                        <strong>المتبقي على العميل:</strong> {returnData.remainingDebt.toFixed(2)} جنيه
                                        {returnData.remainingDebt === 0 && ' (✅ مكتمل)'}
                                    </p>
                                </div>
                            )}

                            {/* الكمية المرتجعة */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>الكمية المرتجعة</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={returnData.quantity}
                                    onChange={handleReturnChange}
                                    required
                                    min="1"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            {/* سبب المرتجع */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>سبب المرتجع</label>
                                <select
                                    name="reason"
                                    value={returnData.reason}
                                    onChange={handleReturnChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">اختر السبب</option>
                                    <option value="فائض">فائض</option>
                                    <option value="تالف">تالف</option>
                                    <option value="عيب صناعة">عيب صناعة</option>
                                </select>
                            </div>

                            {/* قيمة المنتج المرتجع */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>قيمة المنتج المرتجع</label>
                                <input
                                    type="text"
                                    value={returnData.returnAmount ? `${returnData.returnAmount} جنيه` : '0.00 جنيه'}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '14px',
                                        backgroundColor: '#f5f5f5',
                                        fontWeight: 'bold',
                                        color: 'var(--color-danger)'
                                    }}
                                />
                                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                                    يتم حساب القيمة تلقائياً (الكمية × سعر الوحدة)
                                </small>
                            </div>

                            {/* المبلغ المرتجع للعميل */}
                            <div style={{
                                marginBottom: '16px',
                                borderTop: '2px dashed var(--color-border)',
                                paddingTop: '16px'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '4px',
                                    fontWeight: 600,
                                    color: 'var(--color-primary)'
                                }}>
                                    💰 المبلغ المرتجع للعميل
                                </label>
                                <input
                                    type="number"
                                    name="refundAmount"
                                    value={returnData.refundAmount}
                                    onChange={handleReturnChange}
                                    min="0"
                                    // step="0.01"
                                    placeholder="أدخل المبلغ المرتجع للعميل"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '2px solid var(--color-primary)',
                                        fontSize: '14px'
                                    }}
                                />
                                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                                    {returnData.remainingDebt > 0
                                        ? `⚠️ العميل عليه ${returnData.remainingDebt.toFixed(2)} جنيه`
                                        : '✅ العميل مكتمل'}
                                </small>
                            </div>

                            {/* عرض المبلغ المدفوع في أمر المرتجع */}
                            {returnData.paidAmount > 0 && (
                                <div style={{
                                    marginBottom: '16px',
                                    padding: '12px',
                                    backgroundColor: '#d4edda',
                                    borderRadius: '6px',
                                    border: '1px solid #28a745'
                                }}>
                                    <p style={{ margin: '4px 0', color: '#155724', fontWeight: 'bold' }}>
                                        💰 المبلغ المدفوع في أمر المرتجع: {returnData.paidAmount.toFixed(2)} جنيه
                                    </p>
                                    <small style={{ color: '#155724' }}>
                                        {returnData.remainingDebt > 0 && parseFloat(returnData.refundAmount) > returnData.remainingDebt
                                            ? '✅ تم خصم المديونية والباقي مدفوع للعميل'
                                            : '✅ تم تحويل المبلغ للمدفوعات'}
                                    </small>
                                </div>
                            )}

                            {/* إجمالي قيمة المرتجع */}
                            <div style={{
                                marginBottom: '16px',
                                backgroundColor: '#f8f9fa',
                                padding: '16px',
                                borderRadius: '6px',
                                border: '2px solid var(--color-danger)'
                            }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, color: 'var(--color-danger)' }}>
                                    📊 إجمالي قيمة المرتجع النهائي
                                </label>
                                <input
                                    type="text"
                                    value={
                                        returnData.finalTotal
                                            ? `${returnData.finalTotal} جنيه (سالب)`
                                            : '0.00 جنيه'
                                    }
                                    readOnly
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        border: '2px solid var(--color-danger)',
                                        fontSize: '18px',
                                        backgroundColor: '#fff5f5',
                                        fontWeight: 'bold',
                                        color: 'var(--color-danger)'
                                    }}
                                />
                                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                                    الإجمالي النهائي = قيمة المرتجع - المبلغ المرتجع للعميل
                                </small>
                            </div>

                            {/* الحالة النهائية */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>الحالة النهائية</label>
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '6px',
                                    backgroundColor: returnData.status === 'مكتمل' ? '#d4edda' : '#fff3cd',
                                    color: returnData.status === 'مكتمل' ? '#155724' : '#856404',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}>
                                    {returnData.status || 'غير مكتمل'}
                                </div>
                                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                                    {returnData.status === 'مكتمل'
                                        ? '✅ تم دفع المبلغ بالكامل'
                                        : '⚠️ يوجد مبلغ متبقي سيتم سداده'}
                                </small>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsReturnModalOpen(false)
                                        setReturnData({
                                            originalOrderId: '',
                                            product: '',
                                            quantity: '',
                                            reason: '',
                                            returnAmount: '',
                                            refundAmount: '',
                                            finalTotal: '',
                                            status: 'غير مكتمل',
                                            warehouse: '',
                                            unitPrice: 0,
                                            totalPaid: 0,
                                            totalOrderAmount: 0,
                                            remainingDebt: 0,
                                            paidAmount: 0
                                        })
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'var(--color-danger)',
                                        color: '#fff',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    إنشاء المرتجع
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for payment */}
            {isPaymentModalOpen && selectedOrder && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1001,
                    }}
                    onClick={() => setIsPaymentModalOpen(false)}
                >
                    <div
                        style={{
                            background: 'var(--color-surface)',
                            padding: '30px',
                            borderRadius: 'var(--radius-md)',
                            width: '400px',
                            maxWidth: '90%',
                            boxShadow: 'var(--shadow-card)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginBottom: '20px' }}>
                            {selectedOrder.type === 'مرتجع' ? 'سداد المتبقي من المرتجع' : 'سداد المبلغ المتبقي'}
                        </h3>
                        <div style={{ marginBottom: '16px' }}>
                            <p><strong>رقم الأمر:</strong> {selectedOrder.id}</p>
                            <p><strong>المنتج:</strong> {selectedOrder.product}</p>
                            <p><strong>المبلغ الإجمالي:</strong> {selectedOrder.totalAmount.toFixed(2)} جنيه</p>
                            <p><strong>المدفوع:</strong> {selectedOrder.paidAmount.toFixed(2)} جنيه</p>
                            <p style={{
                                color: selectedOrder.remainingAmount > 0 ? 'var(--color-danger)' : 'var(--color-success)',
                                fontWeight: 'bold'
                            }}>
                                <strong>المتبقي:</strong> {Math.abs(selectedOrder.remainingAmount).toFixed(2)} جنيه
                                {selectedOrder.type === 'مرتجع' && selectedOrder.remainingAmount < 0 && ' (مطلوب سداد)'}
                            </p>
                        </div>
                        <form onSubmit={handlePaymentSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                                    المبلغ المطلوب سداده
                                </label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    required
                                    min="0.01"
                                    max={Math.abs(selectedOrder.remainingAmount)}
                                    step="0.01"
                                    placeholder={`أقصى مبلغ: ${Math.abs(selectedOrder.remainingAmount).toFixed(2)}`}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPaymentModalOpen(false)
                                        setSelectedOrder(null)
                                        setPaymentAmount('')
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'var(--color-success)',
                                        color: '#fff',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    تأكيد السداد
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}