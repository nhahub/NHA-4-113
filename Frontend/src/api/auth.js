import { apiPost } from './client.js'

// dto: { username, password } -> { token, expiresAt, user: { id, username, fullName, role } }
export function loginRequest(dto) {
    return apiPost('/auth/login', dto)
}
