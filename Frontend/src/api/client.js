// نقطة الاتصال الأساسية بالـ Backend (Smart.WebApi).
// عنوان الـ API بيتقرأ من ملف .env، فلو الباك اند شغال على بورت مختلف
// غيّر VITE_API_BASE_URL في .env فقط، مش هنا.
import { getStoredToken } from '../utils/tokenStorage.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7100/api'

function authHeaders() {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse(res) {
  if (res.status === 401) {
    // Token missing/expired/invalid - broadcast so AuthContext clears the session
    // and the route guards redirect to /login.
    window.dispatchEvent(new Event('auth:unauthorized'))
  }

  if (!res.ok) {
    // بيحاول يقرأ رسالة الخطأ اللي راجعة من الـ Service layer في الباك اند
    let message = `Request failed with status ${res.status}`
    try {
      const body = await res.json()
      message = body.error || body.title || message
    } catch {
      // مفيش JSON في الرد، هنكتفي بالرسالة الافتراضية
    }
    throw new Error(message)
  }
  // DELETE requests بترجع 204 No Content غالبًا
  if (res.status === 204) return null
  return res.json()
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: { ...authHeaders() } })
  return handleResponse(res)
}

export async function apiPost(path, data) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function apiPut(path, data) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export async function apiDelete(path) {
  const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: { ...authHeaders() } })
  return handleResponse(res)
}
