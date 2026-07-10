import { apiGet } from './client.js'

// { totalProducts, totalUnits, lowStock, totalValue }
export function getReportSummary() {
    return apiGet('/reports/summary')
}

// [{ name, value }] — units in stock grouped by category
export function getCategoryBreakdown() {
    return apiGet('/reports/category-breakdown')
}