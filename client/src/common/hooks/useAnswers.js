import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postKeys } from './usePosts.js'
import { answerService } from '../../services/answerService.js'

// Query keys para answers
export const answerKeys = {
	all: ['answers'],
	lists: () => [...answerKeys.all, 'list'],
	list: filters => [...answerKeys.lists(), filters],
	details: () => [...answerKeys.all, 'detail'],
	detail: id => [...answerKeys.details(), id],
	byPost: postId => [...answerKeys.all, 'by-post', postId],
	likeStatus: () => [...answerKeys.all, 'like-status'],
	likeStatusDetail: answerId => [...answerKeys.likeStatus(), answerId],
	myAnswers: () => [...answerKeys.all, 'my-answers'],
}

// Hook para obtener todas las respuestas de un post específico
export const useAnswersByPost = (postId, params = {}) => {
	return useQuery({
		queryKey: answerKeys.byPost(postId),
		queryFn: async () => {
			const response = await answerService.getAnswersByPostId(postId, params)
			if (!response.success) throw new Error(response.message)
			return response.data
		},
		enabled: !!postId,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	})
}

// Hook para crear una respuesta a un post
export const useCreateAnswer = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ postId, content }) => {
			const response = await answerService.createAnswer(postId, content)
			if (!response.success) throw new Error(response.message || 'Error al crear la respuesta')
			return response.data
		},
		onSuccess: (data, { postId }) => {
			// Invalidar el post específico para recargar con la nueva respuesta
			queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
			// Invalidar las respuestas del post
			queryClient.invalidateQueries({ queryKey: answerKeys.byPost(postId) })
			// Invalidar listas de posts por si cambió el contador
			queryClient.invalidateQueries({ queryKey: postKeys.lists() })
			// Invalidar mis respuestas
			queryClient.invalidateQueries({ queryKey: answerKeys.myAnswers() })
		},
	})
}

// Hook para obtener respuestas con filtros generales
export const useAnswers = (filters = {}) => {
	return useQuery({
		queryKey: answerKeys.list(filters),
		queryFn: async () => {
			const response = await answerService.list(filters)
			if (!response.success) throw new Error(response.message)
			return response.data
		},
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	})
}

// Hook para obtener una respuesta específica por ID
export const useAnswer = answerId => {
	return useQuery({
		queryKey: answerKeys.detail(answerId),
		queryFn: async () => {
			const response = await answerService.getById(answerId)
			if (!response.success) throw new Error(response.message || 'Error al cargar la respuesta')
			return response.data
		},
		enabled: !!answerId,
		staleTime: 5 * 60 * 1000,
	})
}

// Hook para actualizar una respuesta
export const useUpdateAnswer = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, content }) => {
			const response = await answerService.update(id, { content })
			if (!response.success) throw new Error(response.message || 'Error al actualizar la respuesta')
			return response.data
		},
		onSuccess: (data, { id }) => {
			// Actualizar la respuesta específica en cache
			queryClient.invalidateQueries({ queryKey: answerKeys.detail(id) })
			// Invalidar listas que podrían contener esta respuesta
			queryClient.invalidateQueries({ queryKey: answerKeys.lists() })
			// Invalidar el post que contiene esta respuesta
			queryClient.invalidateQueries({ queryKey: postKeys.all })
		},
	})
}

// Hook para eliminar una respuesta (soft delete)
export const useDeleteAnswer = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async answerId => {
			const response = await answerService.softDelete(answerId)
			if (!response.success) throw new Error(response.message || 'Error al eliminar la respuesta')
			return response.data
		},
		onSuccess: (data, answerId) => {
			// Invalidar todas las listas de respuestas
			queryClient.invalidateQueries({ queryKey: answerKeys.lists() })
			// Remover la respuesta específica del cache
			queryClient.removeQueries({ queryKey: answerKeys.detail(answerId) })
			// Invalidar posts que podrían contener esta respuesta
			queryClient.invalidateQueries({ queryKey: postKeys.all })
			// Invalidar mis respuestas
			queryClient.invalidateQueries({ queryKey: answerKeys.myAnswers() })
		},
	})
}

// Hook para eliminar permanentemente una respuesta (hard delete)
export const useHardDeleteAnswer = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async answerId => {
			const response = await answerService.hardDelete(answerId)
			if (!response.success) throw new Error(response.message || 'Error al eliminar la respuesta')
			return response.data
		},
		onSuccess: (data, answerId) => {
			// Invalidar todas las listas de respuestas
			queryClient.invalidateQueries({ queryKey: answerKeys.lists() })
			// Remover la respuesta específica del cache
			queryClient.removeQueries({ queryKey: answerKeys.detail(answerId) })
			// Invalidar posts
			queryClient.invalidateQueries({ queryKey: postKeys.all })
		},
	})
}

// Hook para restaurar una respuesta eliminada
export const useRestoreAnswer = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async answerId => {
			const response = await answerService.restore(answerId)
			if (!response.success) throw new Error(response.message || 'Error al restaurar la respuesta')
			return response.data
		},
		onSuccess: (data, answerId) => {
			// Invalidar todas las listas
			queryClient.invalidateQueries({ queryKey: answerKeys.lists() })
			queryClient.invalidateQueries({ queryKey: answerKeys.detail(answerId) })
			queryClient.invalidateQueries({ queryKey: postKeys.all })
		},
	})
}

// Hook para dar/quitar like a una respuesta
export const useToggleAnswerLike = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async answerId => {
			const response = await answerService.toggleLike(answerId)
			if (!response.success) throw new Error(response.message || 'Error al dar like')
			return response.data
		},
		onSuccess: (data, answerId) => {
			queryClient.invalidateQueries({ queryKey: answerKeys.detail(answerId) })
			queryClient.invalidateQueries({ queryKey: answerKeys.lists() })
			queryClient.invalidateQueries({ queryKey: answerKeys.likeStatusDetail(answerId) })
			// También invalidar el post para actualizar contadores
			queryClient.invalidateQueries({ queryKey: postKeys.all })
		},
	})
}

// Hook para verificar estado de like de una respuesta
export const useAnswerLikeStatus = answerId => {
	return useQuery({
		queryKey: answerKeys.likeStatusDetail(answerId),
		queryFn: async () => {
			const response = await answerService.checkLike(answerId)
			if (!response.success) throw new Error(response.message || 'Error al verificar like')
			return response.data
		},
		enabled: !!answerId,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	})
}

// Hook para obtener mis respuestas
export const useMyAnswers = (params = {}) => {
	return useQuery({
		queryKey: answerKeys.myAnswers(),
		queryFn: async () => {
			const response = await answerService.getMyAnswers(params)
			if (!response.success) throw new Error(response.message)
			return response
		},
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	})
}
