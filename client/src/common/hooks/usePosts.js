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
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
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
		enabled: !!postId,
		staleTime: 5 * 60 * 1000,
	})
}

// Hook para actualizar un post
export const useUpdatePost = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, data }) => {
			const response = await postService.update(id, data)
			if (!response.success) throw new Error(response.message || 'Error al actualizar el post')
			return response.data
		},
		onSuccess: (data, { id }) => {
			// Actualizar el post específico en cache
			queryClient.invalidateQueries({ queryKey: postKeys.detail(id) })
			// También invalidar las listas que podrían contener este post
			queryClient.invalidateQueries({ queryKey: postKeys.lists() })
		},
	})
}

// Hook para eliminar un post
export const useSoftDeletePost = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async postId => {
			const response = await postService.softDelete(postId)
			if (!response.success) throw new Error(response.message || 'Error al eliminar el post')
			return response.data
		},
		onSuccess: (data, postId) => {
			// Invalidar todas las listas de posts
			queryClient.invalidateQueries({ queryKey: postKeys.lists() })
			// Remover el post específico del cache
			queryClient.removeQueries({ queryKey: postKeys.detail(postId) })
		},
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
			queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
			queryClient.invalidateQueries({ queryKey: postKeys.lists() })
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
		enabled: !!postId,
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
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
