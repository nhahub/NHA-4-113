import { apiGet, apiPost, apiPut, apiDelete } from './client.js'

// كل دالة هنا بترجع Promise وبتتكلم مباشرة مع ProductsController في الباك اند.

// من غير باراميترات: بيرجع كل المنتجات (زي ما هو مستخدم في Dashboard.jsx لحساب الإحصائيات).
// بـ { page, pageSize }: بيرجع صفحة واحدة بس، على شكل { items, page, pageSize, totalCount, totalPages }.
// بـ { search }: البحث بيتبعت للباك اند وبيتطبّق على كل الداتا سيت، مش بس الصفحة المحمّلة حاليًا.
export function getProducts({ page, pageSize, search } = {}) {
    if (page) {
        const params = new URLSearchParams({ page, pageSize: pageSize ?? 20 })
        if (search) params.set('search', search)
        return apiGet(`/products?${params.toString()}`)
    }
    return apiGet('/products')
}

export function getLowStockProducts() {
    return apiGet('/products/low-stock')
}

export function getProductById(id) {
    return apiGet(`/products/${id}`)
}

// dto لازم يطابق CreateProductDto في الباك اند:
// { name, sku, description, unitPrice, quantityInStock, reorderLevel, categoryId, supplierId, warehouseId? }
export function createProduct(dto) {
    return apiPost('/products', dto)
}

export function updateProduct(id, dto) {
    return apiPut(`/products/${id}`, dto)
}

export function deleteProduct(id) {
    return apiDelete(`/products/${id}`)
}