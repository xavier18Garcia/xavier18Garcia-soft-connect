import { postService } from '../../services/postService.js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Query keys
export const postKeys = {
	all: ['posts'],
	lists: () => [...postKeys.all, 'list'],
	list: filters => [...postKeys.lists(), filters],
	details: () => [...postKeys.all, 'detail'],
	detail: id => [...postKeys.details(), id],
	likeStatus: () => [...postKeys.all, 'like-status'],
	likeStatusDetail: postId => [...postKeys.likeStatus(), postId],
}

// Hook para obtener posts con filtros
export const usePosts = (filters = {}) => {
	return useQuery({
		queryKey: postKeys.list(filters),
		queryFn: async () => {
			const response = await postService.list(filters)
			if (!response.success) throw new Error(response.message)
			return response
		},
		staleTime: 2 * 60 * 1000, // 2 minutos
		gcTime: 5 * 60 * 1000, // 5 minutos
	})
}

// Hook para crear un nuevo post
export const useCreatePost = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async postData => {
			const response = await postService.create(postData)
			if (!response.success) throw new Error(response.message || 'Error al crear el post')
			return response.data
		},
		onSuccess: () => {
			// Invalidar las queries de listas de posts para refrescar los datos
			queryClient.invalidateQueries({ queryKey: postKeys.lists() })
		},
	})
}

// Hook para obtener un post específico
export const usePost = postId => {
	return useQuery({
		queryKey: postKeys.detail(postId),
		queryFn: async () => {
			const response = await postService.getById(postId)
			if (!response.success) throw new Error(response.message || 'Error al cargar el post')
			return response.data
		},
		enabled: !!postId, // Solo ejecutar si hay un postId
		staleTime: 5 * 60 * 1000, // 5 minutos
	})
}

// Hook para toggle like
export const useToggleLike = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async postId => {
			const response = await postService.toggleLike(postId)
			if (!response.success) throw new Error(response.message || 'Error al dar like')
			return response.data
		},
		onSuccess: (data, postId) => {
			// Actualizar el post específico en cache
			queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
			// También invalidar las listas que podrían contener este post
			queryClient.invalidateQueries({ queryKey: postKeys.lists() })
			// Invalidar el estado de like específico
			queryClient.invalidateQueries({ queryKey: postKeys.likeStatusDetail(postId) })
		},
	})
}

// Verificar estado de like del usuario actual
export const usePostLikeStatus = postId => {
	return useQuery({
		queryKey: postKeys.likeStatusDetail(postId),
		queryFn: async () => {
			const response = await postService.checkLike(postId)
			if (!response.success) throw new Error(response.message || 'Error al verificar like')
			return response.data
		},
		enabled: !!postId, // Solo ejecutar si hay un postId
		staleTime: 2 * 60 * 1000, // 2 minutos
		gcTime: 5 * 60 * 1000, // 5 minutos
	})
}

// Hook para marcar como resuelto
export const useMarkAsSolved = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async postId => {
			const response = await postService.markAsSolved(postId)
			if (!response.success) throw new Error(response.message || 'Error al marcar como resuelto')
			return response.data
		},
		onSuccess: (data, postId) => {
			queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
			queryClient.invalidateQueries({ queryKey: postKeys.lists() })
		},
	})
}
