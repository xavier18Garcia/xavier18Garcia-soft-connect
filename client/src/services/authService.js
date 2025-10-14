import axios from 'axios'
import { PATH_ROUTES } from '../common/const/pauthRoute-const'

const API_BASE_URL = import.meta.env.VITE_API_URL

// Configurar axios por defecto
axios.defaults.withCredentials = true

// Crear instancia personalizada
const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Interceptor para requests
api.interceptors.request.use(
	config => {
		const token = localStorage.getItem('accessToken')
		if (token) config.headers.Authorization = `Bearer ${token}`
		return config
	},
	error => {
		return Promise.reject(error)
	}
)

// Interceptor para responses
api.interceptors.response.use(
	response => {
		return response
	},
	async error => {
		const originalRequest = error.config

		// Si el error es 401 y no hemos intentado refrescar
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			try {
				// Intentar refrescar el token
				const refreshResponse = await api.post('/auth/refresh-token')
				const { accessToken } = refreshResponse.data.data

				// Guardar nuevo token
				localStorage.setItem('accessToken', accessToken)

				// Reintentar la request original con el nuevo token
				originalRequest.headers.Authorization = `Bearer ${accessToken}`
				return api(originalRequest)
			} catch (refreshError) {
				// Si el refresh falla, limpiar y redirigir al login
				localStorage.removeItem('accessToken')
				localStorage.removeItem('userData')
				window.location.href = `/${PATH_ROUTES.AUTH.SIGNIN}`
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	}
)

export const authService = {
	// Login
	async login(credentials) {
		try {
			const response = await api.post('/auth/login', credentials)
			const { accessToken, refreshToken } = response.data.data

			localStorage.setItem('accessToken', accessToken)

			const userData = this.decodeToken(accessToken)
			localStorage.setItem('userData', JSON.stringify(userData))

			return {
				success: true,
				data: response.data,
				user: userData,
			}
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Error de conexión',
				status: error.response?.status,
			}
		}
	},

	async register(credentials) {
		try {
			const response = await api.post('/auth/register', credentials)
			const { accessToken, refreshToken } = response.data.data

			localStorage.setItem('accessToken', accessToken)

			const userData = this.decodeToken(accessToken)
			localStorage.setItem('userData', JSON.stringify(userData))

			return {
				success: true,
				data: response.data,
				user: userData,
			}
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Error de conexión',
				status: error.response?.status,
			}
		}
	},

	// Refresh token
	async refreshToken() {
		try {
			const response = await api.post('/auth/refresh-token')
			const { accessToken } = response.data.data

			localStorage.setItem('accessToken', accessToken)

			const userData = this.decodeToken(accessToken)
			localStorage.setItem('userData', JSON.stringify(userData))

			return { success: true, data: response.data }
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Error al refrescar token',
			}
		}
	},

	// Logout
	async logout() {
		try {
			await api.post('/auth/logout')
		} catch (error) {
			console.warn('Error durante logout:', error.message)
		} finally {
			localStorage.removeItem('accessToken')
			localStorage.removeItem('userData')
			window.location.href = `/${PATH_ROUTES.AUTH.SIGNIN}`
		}
	},

	// Decodificar token JWT
	decodeToken(token) {
		try {
			const base64Url = token.split('.')[1]
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
			const jsonPayload = decodeURIComponent(
				atob(base64)
					.split('')
					.map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
					.join('')
			)
			return JSON.parse(jsonPayload)
		} catch (error) {
			console.error('Error decodificando token:', error)
			return null
		}
	},

	// Verificar autenticación
	isAuthenticated() {
		const token = localStorage.getItem('accessToken')
		if (!token) return false

		try {
			const tokenData = this.decodeToken(token)
			const now = Math.floor(Date.now() / 1000)
			return tokenData.exp > now
		} catch (error) {
			return false
		}
	},

	// Obtener datos del usuario
	getUserData() {
		try {
			const userData = localStorage.getItem('userData')
			return userData ? JSON.parse(userData) : null
		} catch (error) {
			return null
		}
	},

	// Método genérico para requests API
	async apiRequest(config) {
		try {
			const response = await api(config)
			return { success: true, data: response.data }
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
				status: error.response?.status,
			}
		}
	},

	// En authService.js - Añadir este método a la exportación
	async getCurrentUser() {
		try {
			const response = await api.get('/auth/me')
			const userData = response.data.data

			// Actualiza los datos en localStorage si es necesario
			localStorage.setItem('userData', JSON.stringify(userData))

			return {
				success: true,
				data: response.data,
				user: userData,
			}
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Error al obtener datos del usuario',
				status: error.response?.status,
			}
		}
	},
}

// Exportar la instancia de axios para uso general
export { api as axiosInstance }

export default api
