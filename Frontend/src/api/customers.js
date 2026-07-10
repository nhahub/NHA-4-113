import { apiGet, apiPost, apiPut, apiDelete } from './client.js'

// بـ { search }: البحث بيشتغل عبر كل العملاء المسجّلين، مش بس صفحة الـ 10 المحمّلة.
export function getCustomers({ page, pageSize, search } = {}) {
    if (page) {
        const params = new URLSearchParams({ page, pageSize: pageSize ?? 20 })
        if (search) params.set('search', search)
        return apiGet(`/customers?${params.toString()}`)
    }
    return apiGet('/customers')
}

export function getCustomerById(id) {
    return apiGet(`/customers/${id}`)
}

// dto: { name, email, phone, address, category }
export function createCustomer(dto) {
    return apiPost('/customers', dto)
}

export function updateCustomer(id, dto) {
    return apiPut(`/customers/${id}`, dto)
}

export function deleteCustomer(id) {
    return apiDelete(`/customers/${id}`)
}