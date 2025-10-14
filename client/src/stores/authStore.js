import { toast } from 'sonner'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService.js'
import { ROLE_ALLOW } from '../common/const/role-const.js'

export const useAuthStore = create(
	persist(
		(set, get) => ({
			// Estado inicial
			user: null,
			isAuthenticated: false,
			loading: true, // Cambiado a true inicialmente
			error: null,
			isInitialized: false, // Nuevo flag para saber si se ha inicializado

			// Actions
			login: async credentials => {
				set({ loading: true, error: null })
				const result = await authService.login(credentials)

				if (result.success) {
					set({
						user: result.user,
						isAuthenticated: true,
						loading: false,
						error: null,
						isInitialized: true,
					})
					return { success: true, data: result.data }
				} else {
					set({
						error: result.error,
						isAuthenticated: false,
						user: null,
						loading: false,
						isInitialized: true,
					})
					return { success: false, error: result.error }
				}
			},

			register: async userData => {
				set({ loading: true, error: null })

				try {
					const result = await authService.register(userData)

					if (result.success) {
						// Guardar el usuario recién registrado y marcar como autenticado
						set({
							user: result.user,
							isAuthenticated: true,
							loading: false,
							error: null,
							isInitialized: true,
						})
						return { success: true, data: result.data }
					} else {
						set({
							error: result.error,
							isAuthenticated: false,
							user: null,
							loading: false,
							isInitialized: true,
						})
						toast.error(result.error)
						return { success: false, error: result.error }
					}
				} catch (error) {
					console.error('Error registrando usuario:', error)
					set({
						error: 'Error registrando usuario',
						isAuthenticated: false,
						user: null,
						loading: false,
						isInitialized: true,
					})
					return { success: false, error: 'Error registrando usuario' }
				}
			},

			logout: async () => {
				set({ loading: true })
				try {
					await authService.logout()
					set({
						user: null,
						isAuthenticated: false,
						error: null,
						loading: false,
						isInitialized: true,
					})
				} catch (error) {
					set({ error: 'Error al cerrar sesión', loading: false })
				}
			},

			// En useAuthStore - Corregir la acción checkAuth
			checkAuth: async () => {
				// Evitar múltiples verificaciones simultáneas
				if (get().loading && get().isInitialized) return get().isAuthenticated

				set({ loading: true })

				try {
					const isAuth = authService.isAuthenticated()

					if (isAuth) {
						// Intentar obtener los datos actualizados del backend
						const result = await authService.getCurrentUser()

						if (result.success) {
							set({
								isAuthenticated: true,
								user: result.user, // ← Cambiar result.data por result.user
								loading: false,
								isInitialized: true,
								error: null,
							})
							return true
						} else {
							// Si el endpoint /me falla, limpiar
							console.error('Falló getCurrentUser:', result.error)
							await get().logout()
							return false
						}
					} else {
						// Si no está autenticado localmente
						set({
							isAuthenticated: false,
							user: null,
							loading: false,
							isInitialized: true,
							error: null,
						})
						return false
					}
				} catch (error) {
					console.error('Error checking auth:', error)
					set({
						isAuthenticated: false,
						user: null,
						loading: false,
						isInitialized: true,
						error: 'Error verificando autenticación',
					})
					return false
				}
			},

			refreshToken: async () => {
				const result = await authService.refreshToken()
				if (result.success) {
					const userData = authService.getUserData()
					set({ isAuthenticated: true, user: userData })
					return true
				} else {
					set({ isAuthenticated: false, user: null })
					return false
				}
			},

			clearError: () => set({ error: null }),

			// Método para inicializar el store
			initialize: async () => {
				if (get().isInitialized) return
				await get().checkAuth()
			},

			// Selectors (getters)
			getUser: () => get().user,
			getIsAuthenticated: () => get().isAuthenticated,
			getLoading: () => get().loading,
			getError: () => get().error,
			getIsInitialized: () => get().isInitialized,

			// Computed values
			getUserRole: () => get().user?.role || null,
			getUserId: () => get().user?.id || null,
			isAdmin: () => get().user?.role === ROLE_ALLOW.ADMIN,
			isStudent: () => get().user?.role === ROLE_ALLOW.STUDENT,
			getTokenExpiration: () => {
				const user = get().user
				if (!user?.exp) return null
				return new Date(user.exp * 1000)
			},

			// Agregar nuevos getters para la nueva estructura
			getUserFullName: () => {
				const user = get().user
				if (!user) return null
				return `${user.firstName} ${user.lastName}`.trim()
			},

			getUserEmail: () => get().user?.email || null,
			getUserStatus: () => get().user?.status || null,
		}),
		{
			name: 'auth-storage',
			partialize: state => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
			onRehydrateStorage: () => state => {
				// Después de rehidratar desde el storage, verificar la autenticación
				if (state) {
					// No marcar como inicializado todavía, checkAuth lo hará
					state.loading = true
					state.isInitialized = false
					// Verificar autenticación de forma asíncrona
					setTimeout(() => state.checkAuth(), 0)
				}
			},
		}
	)
)

// Hook personalizado mejorado
export const useAuth = () => {
	const {
		user,
		isAuthenticated,
		loading,
		error,
		isInitialized,
		login,
		register,
		logout,
		checkAuth,
		refreshToken,
		clearError,
		initialize,
		getUser,
		getIsAuthenticated,
		getLoading,
		getError,
		getIsInitialized,
		getUserRole,
		getUserId,
		isAdmin,
		isStudent,
		getTokenExpiration,
	} = useAuthStore()

	return {
		// State
		user,
		isAuthenticated,
		loading,
		error,
		isInitialized,
		// Actions
		login,
		register,
		logout,
		checkAuth,
		refreshToken,
		clearError,
		initialize,
		// Getters
		getUser,
		getIsAuthenticated,
		getLoading,
		getError,
		getIsInitialized,
		getUserRole,
		getUserId,
		isAdmin: isAdmin(),
		isStudent: isStudent(),
		getTokenExpiration,
	}
}
