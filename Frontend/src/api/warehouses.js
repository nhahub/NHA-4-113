import { apiGet, apiPost } from './client.js'

export function getWarehouses() {
  return apiGet('/warehouses')
}

export function getWarehouseById(id) {
  return apiGet(`/warehouses/${id}`)
}

// dto: { name, capacityUsed }
export function createWarehouse(dto) {
  return apiPost('/warehouses', dto)
}