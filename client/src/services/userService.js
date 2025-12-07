import { authService } from './authService'

export const userService = {
	// Crear usuario
	async create(userData) {
		return await authService.apiRequest({
			method: 'POST',
			url: '/users',
			data: userData,
		})
	},

	// Listar usuarios con paginación y filtros
	async list(params = {}) {
		const queryParams = new URLSearchParams()

		// Agregar parámetros opcionales
		if (params.page) queryParams.append('page', params.page)
		if (params.limit) queryParams.append('limit', params.limit)
		if (params.search) queryParams.append('search', params.search)
		if (params.role) queryParams.append('role', params.role)
		if (params.status) queryParams.append('status', params.status)

		const queryString = queryParams.toString()
		const url = queryString ? `/users?q=${queryString}` : '/users'

		return await authService.apiRequest({
			method: 'GET',
			url: url,
		})
	},

	// Obtener usuario por ID
	async getById(userId) {
		return await authService.apiRequest({
			method: 'GET',
			url: `/users/${userId}`,
		})
	},

	// Actualizar usuario
	async update(userId, userData) {
		return await authService.apiRequest({
			method: 'PUT',
			url: `/users/${userId}`,
			data: userData,
		})
	},

	// Eliminación lógica (soft delete)
	async softDelete(userId) {
		return await authService.apiRequest({
			method: 'DELETE',
			url: `/users/${userId}`,
		})
	},

	// Eliminación permanente (hard delete)
	async hardDelete(userId) {
		return await authService.apiRequest({
			method: 'DELETE',
			url: `/users/${userId}/hard`,
		})
	},

	// Obtener perfil del usuario actual
	async getProfile() {
		const userData = authService.getUserData()
		if (!userData || !userData.id) {
			return { success: false, error: 'Usuario no autenticado' }
		}
		return await this.getById(userData.id)
	},

	// Actualizar perfil del usuario actual
	async updateProfile(userData) {
		const currentUser = authService.getUserData()
		if (!currentUser || !currentUser.id) {
			return { success: false, error: 'Usuario no autenticado' }
		}
		return await this.update(currentUser.id, userData)
	},
}
