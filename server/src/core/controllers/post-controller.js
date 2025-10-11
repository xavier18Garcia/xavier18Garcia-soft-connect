import { postService } from '../services/post-service.js'
import { PostListDTO, PostDetailDTO } from '../dto/post-dto.js'
import { sendResponse } from '../../common/helpers/responseHandler-helper.js'
import { handleZodValidation } from '../../common/utils/validationZod-util.js'
import { createPostSchema, updatePostSchema, listPostsQuerySchema, postIdSchema } from '../validators/post-validator.js'

export class PostController {
	static async create(req, res) {
		try {
			// Validar datos de entrada
			const validation = handleZodValidation(createPostSchema, req.body)
			if (!validation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'Datos de entrada inválidos',
					error: {
						details: validation.errors,
					},
				})
			}

			const post = await postService.createPost(validation.data, req.user.id)
			const postDTO = new PostDetailDTO(post)

			return sendResponse(res, {
				statusCode: 201,
				message: 'Post creado exitosamente',
				data: postDTO,
			})
		} catch (error) {
			console.log(error)
			let statusCode = 500
			let message = 'Error interno del servidor'

			if (error.statusCode) {
				statusCode = error.statusCode
				message = error.message
			} else if (error.name === 'SequelizeValidationError') {
				statusCode = 400
				message = 'Datos inválidos: ' + error.errors.map(e => e.message).join(', ')
			}

			return sendResponse(res, {
				statusCode,
				message,
			})
		}
	}

	static async list(req, res) {
		try {
			// Validar parámetros de consulta
			const queryValidation = handleZodValidation(listPostsQuerySchema, req.query)
			if (!queryValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'Parámetros de consulta inválidos',
					error: {
						details: queryValidation.errors,
					},
				})
			}

			const { search, status, is_solved, page, limit, authorId } = queryValidation.data

			const result = await postService.getPosts({
				search,
				status,
				is_solved,
				page,
				limit,
				authorId,
			})

			const postsDTO = PostListDTO.fromArray(result.data)

			return sendResponse(res, {
				statusCode: 200,
				data: postsDTO,
				meta: {
					totalRecords: result.totalRecords,
					currentPage: result.currentPage,
					totalPages: result.totalPages,
				},
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al obtener posts',
			})
		}
	}

	static async get(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(postIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de post inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const post = await postService.getPostById(paramValidation.data.id, false, true)
			const postDTO = new PostDetailDTO(post)

			return sendResponse(res, {
				statusCode: 200,
				data: postDTO,
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al obtener post',
			})
		}
	}

	static async getMyPosts(req, res) {
		try {
			// Validar parámetros de consulta
			const queryValidation = handleZodValidation(listPostsQuerySchema, req.query)
			if (!queryValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'Parámetros de consulta inválidos',
					error: {
						details: queryValidation.errors,
					},
				})
			}

			const result = await postService.getUserPosts(req.user.id, queryValidation.data)
			const postsDTO = PostListDTO.fromArray(result.data)

			return sendResponse(res, {
				statusCode: 200,
				data: postsDTO,
				meta: {
					totalRecords: result.totalRecords,
					currentPage: result.currentPage,
					totalPages: result.totalPages,
				},
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al obtener mis posts',
			})
		}
	}

	static async update(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(postIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de post inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			// Validar datos de actualización
			const bodyValidation = handleZodValidation(updatePostSchema, req.body)
			if (!bodyValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'Datos de actualización inválidos',
					error: {
						details: bodyValidation.errors,
					},
				})
			}

			const isAdmin = req.user?.role === 'admin'
			const post = await postService.updatePost(paramValidation.data.id, bodyValidation.data, req.user.id, isAdmin)

			const postDTO = new PostDetailDTO(post)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Post actualizado exitosamente',
				data: postDTO,
			})
		} catch (error) {
			let statusCode = 500
			let message = 'Error interno del servidor'

			if (error.statusCode) {
				statusCode = error.statusCode
				message = error.message
			}

			return sendResponse(res, {
				statusCode,
				message,
			})
		}
	}

	static async softDelete(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(postIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de post inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const isAdmin = req.user?.role === 'admin'
			await postService.deletePost(paramValidation.data.id, req.user.id, isAdmin, false)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Post eliminado exitosamente',
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al eliminar post',
			})
		}
	}

	static async hardDelete(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(postIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de post inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const isAdmin = req.user?.role === 'admin'
			await postService.deletePost(paramValidation.data.id, req.user.id, isAdmin, true)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Post eliminado permanentemente',
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al eliminar post permanentemente',
			})
		}
	}

	static async toggleLike(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(postIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de post inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const result = await postService.toggleLike(paramValidation.data.id, req.user.id)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Like actualizado',
				data: result,
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al dar like',
			})
		}
	}

	static async markAsSolved(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(postIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de post inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const post = await postService.markAsSolved(paramValidation.data.id, req.user.id)
			const postDTO = new PostDetailDTO(post)

			return sendResponse(res, {
				statusCode: 200,
				message: `Post marcado como ${post.is_solved ? 'resuelto' : 'no resuelto'}`,
				data: postDTO,
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al marcar post como resuelto',
			})
		}
	}

	static async checkLike(req, res) {
		try {
			const paramValidation = handleZodValidation(postIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de post inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const result = await postService.checkUserLike(paramValidation.data.id, req.user?.id)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Estado de like obtenido',
				data: result,
			})
		} catch (error) {
			console.log(error)
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al verificar like',
			})
		}
	}
}

export const postController = new PostController()
