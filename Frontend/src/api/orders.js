import { apiGet, apiPost } from './client.js'

export function getOrders() {
    return apiGet('/orders')
}

export function getOrderById(id) {
    return apiGet(`/orders/${id}`)
}

// dto: { type: 'توريد' | 'صرف', productId, warehouseId, quantity, paidAmount }
export function createOrder(dto) {
    return apiPost('/orders', dto)
}

// dto: { originalOrderId, quantity, reason, refundAmount }
export function createReturn(dto) {
    return apiPost('/orders/return', dto)
}

// dto: { amount }
export function payOrder(id, dto) {
    return apiPost(`/orders/${id}/payment`, dto)
}