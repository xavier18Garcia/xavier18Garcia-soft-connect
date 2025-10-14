import { authService } from './authService.js'

export const postService = {
	// Crear post
	async create(postData) {
		return await authService.apiRequest({
			method: 'POST',
			url: '/posts',
			data: postData,
		})
	},

	// Listar posts con paginación y filtros
	async list(params = {}) {
		const queryParams = new URLSearchParams()

		// Agregar parámetros opcionales
		if (params.page) queryParams.append('page', params.page)
		if (params.limit) queryParams.append('limit', params.limit)
		if (params.search) queryParams.append('search', params.search)
		if (params.status) queryParams.append('status', params.status)
		if (params.is_solved) queryParams.append('is_solved', params.is_solved)
		if (params.authorId) queryParams.append('authorId', params.authorId)

		const queryString = queryParams.toString()
		const url = queryString ? `/posts?${queryString}` : '/posts'

		return await authService.apiRequest({
			method: 'GET',
			url: url,
		})
	},

	// Obtener post por ID
	async getById(postId) {
		return await authService.apiRequest({
			method: 'GET',
			url: `/posts/${postId}`,
		})
	},

	// Actualizar post
	async update(postId, postData) {
		return await authService.apiRequest({
			method: 'PUT',
			url: `/posts/${postId}`,
			data: postData,
		})
	},

	// Eliminación lógica (soft delete)
	async softDelete(postId) {
		return await authService.apiRequest({
			method: 'DELETE',
			url: `/posts/${postId}/soft`,
		})
	},

	// Eliminación permanente (hard delete)
	async hardDelete(postId) {
		return await authService.apiRequest({
			method: 'DELETE',
			url: `/posts/${postId}/hard`,
		})
	},

	// Dar/quitar like a un post
	async toggleLike(postId) {
		return await authService.apiRequest({
			method: 'POST',
			url: `/posts/${postId}/like`,
		})
	},

	// Verificar si el usuario actual dio like a un post
	async checkLike(postId) {
		return await authService.apiRequest({
			method: 'GET',
			url: `/posts/${postId}/check-like`,
		})
	},

	// Marcar/desmarcar como resuelto
	async markAsSolved(postId) {
		return await authService.apiRequest({
			method: 'PATCH',
			url: `/posts/${postId}/solved`,
		})
	},

	// Obtener mis posts (posts del usuario actual)
	async getMyPosts(params = {}) {
		const queryParams = new URLSearchParams()

		// Agregar parámetros opcionales
		if (params.page) queryParams.append('page', params.page)
		if (params.limit) queryParams.append('limit', params.limit)
		if (params.status) queryParams.append('status', params.status)

		const queryString = queryParams.toString()
		const url = queryString ? `/posts/my/posts?${queryString}` : '/posts/my/posts'

		return await authService.apiRequest({
			method: 'GET',
			url: url,
		})
	},

	// Incrementar contador de vistas (si tu API lo soporta)
	async incrementViews(postId) {
		return await authService.apiRequest({
			method: 'PATCH',
			url: `/posts/${postId}/view`,
		})
	},
}
