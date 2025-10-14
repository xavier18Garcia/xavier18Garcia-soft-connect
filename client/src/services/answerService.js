import { authService } from './authService.js'

export const answerService = {
	// Crear respuesta
	async createAnswer(postId, content) {
		return await authService.apiRequest({
			method: 'POST',
			url: '/answers',
			data: {
				content,
				postId,
			},
		})
	},

	// Obtener todas las respuestas de un post específico
	async getAnswersByPostId(postId, params = {}) {
		const queryParams = new URLSearchParams()
		if (params.page) queryParams.append('page', params.page)
		if (params.limit) queryParams.append('limit', params.limit)

		const queryString = queryParams.toString()
		const url = queryString ? `/answers/post/${postId}?${queryString}` : `/answers/post/${postId}`

		return await authService.apiRequest({
			method: 'GET',
			url: url,
		})
	},

	// Listar todas las respuestas con filtros
	async list(params = {}) {
		const queryParams = new URLSearchParams()
		if (params.page) queryParams.append('page', params.page)
		if (params.limit) queryParams.append('limit', params.limit)
		if (params.search) queryParams.append('search', params.search)
		if (params.postId) queryParams.append('postId', params.postId)
		if (params.authorId) queryParams.append('authorId', params.authorId)

		const queryString = queryParams.toString()
		const url = queryString ? `/answers?${queryString}` : '/answers'

		return await authService.apiRequest({
			method: 'GET',
			url: url,
		})
	},

	// Obtener una respuesta específica por ID
	async getById(answerId) {
		return await authService.apiRequest({
			method: 'GET',
			url: `/answers/${answerId}`,
		})
	},

	// Actualizar una respuesta
	async update(answerId, answerData) {
		return await authService.apiRequest({
			method: 'PUT',
			url: `/answers/${answerId}`,
			data: answerData,
		})
	},

	// Eliminación lógica (soft delete)
	async softDelete(answerId) {
		return await authService.apiRequest({
			method: 'DELETE',
			url: `/answers/${answerId}/soft`,
		})
	},

	// Eliminación permanente (hard delete) - solo admin
	async hardDelete(answerId) {
		return await authService.apiRequest({
			method: 'DELETE',
			url: `/answers/${answerId}/hard`,
		})
	},

	// Restaurar respuesta eliminada
	async restore(answerId) {
		return await authService.apiRequest({
			method: 'POST',
			url: `/answers/${answerId}/restore`,
		})
	},

	// Dar/quitar like a una respuesta
	async toggleLike(answerId) {
		return await authService.apiRequest({
			method: 'POST',
			url: `/answers/${answerId}/like`,
		})
	},

	// Verificar si el usuario actual dio like a una respuesta
	async checkLike(answerId) {
		return await authService.apiRequest({
			method: 'GET',
			url: `/answers/${answerId}/check-like`,
		})
	},

	// Obtener mis respuestas (respuestas del usuario actual)
	async getMyAnswers(params = {}) {
		const queryParams = new URLSearchParams()
		if (params.page) queryParams.append('page', params.page)
		if (params.limit) queryParams.append('limit', params.limit)
		if (params.search) queryParams.append('search', params.search)

		const queryString = queryParams.toString()
		const url = queryString ? `/answers/my/answers?${queryString}` : '/answers/my/answers'

		return await authService.apiRequest({
			method: 'GET',
			url: url,
		})
	},
}
