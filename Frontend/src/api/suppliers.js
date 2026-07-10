import { apiGet, apiPost, apiPut, apiDelete } from './client.js'

// بـ { search }: البحث بيشتغل عبر كل الموردين المسجّلين، مش بس صفحة الـ 10 المحمّلة.
export function getSuppliers({ page, pageSize, search } = {}) {
    if (page) {
        const params = new URLSearchParams({ page, pageSize: pageSize ?? 20 })
        if (search) params.set('search', search)
        return apiGet(`/suppliers?${params.toString()}`)
    }
    return apiGet('/suppliers')
}

export function getSupplierById(id) {
    return apiGet(`/suppliers/${id}`)
}

// dto: { name, category, phone, email, address }
export function createSupplier(dto) {
    return apiPost('/suppliers', dto)
}

export function updateSupplier(id, dto) {
    return apiPut(`/suppliers/${id}`, dto)
}

export function deleteSupplier(id) {
    return apiDelete(`/suppliers/${id}`)
}