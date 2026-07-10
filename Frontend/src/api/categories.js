import { apiGet, apiPost, apiPut, apiDelete } from './client.js'

export function getCategories() {
  return apiGet('/categories')
}

export function getCategoryById(id) {
  return apiGet(`/categories/${id}`)
}

// dto: { name, description }
export function createCategory(dto) {
  return apiPost('/categories', dto)
}

export function updateCategory(id, dto) {
  return apiPut(`/categories/${id}`, dto)
}

export function deleteCategory(id) {
  return apiDelete(`/categories/${id}`)
}
