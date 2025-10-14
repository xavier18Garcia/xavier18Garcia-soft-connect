import { answerService } from '../services/answer-service.js'
import { AnswerListDTO, AnswerDetailDTO } from '../dto/answer-dto.js'
import { sendResponse } from '../../common/helpers/responseHandler-helper.js'
import { handleZodValidation } from '../../common/utils/validationZod-util.js'
import {
	createAnswerSchema,
	updateAnswerSchema,
	listAnswersQuerySchema,
	answerIdSchema,
} from '../validators/answer-validator.js'

export class AnswerController {
	static async create(req, res) {
		try {
			// Validar datos de entrada
			const validation = handleZodValidation(createAnswerSchema, req.body)
			if (!validation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'Datos de entrada inválidos',
					error: {
						details: validation.errors,
					},
				})
			}

			const { content, postId } = validation.data
			const answer = await answerService.createAnswer(content, req.user.id, postId)
			const answerDTO = new AnswerDetailDTO(answer)

			return sendResponse(res, {
				statusCode: 201,
				message: 'Respuesta creada exitosamente',
				data: answerDTO,
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
			const queryValidation = handleZodValidation(listAnswersQuerySchema, req.query)
			if (!queryValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'Parámetros de consulta inválidos',
					error: {
						details: queryValidation.errors,
					},
				})
			}

			const { postId, authorId, search, page, limit } = queryValidation.data

			const result = await answerService.getAnswers({
				postId,
				authorId,
				search,
				page,
				limit,
			})

			const answersDTO = AnswerListDTO.fromArray(result.data)

			return sendResponse(res, {
				statusCode: 200,
				data: answersDTO,
				meta: {
					totalRecords: result.totalRecords,
					currentPage: result.currentPage,
					totalPages: result.totalPages,
				},
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al obtener respuestas',
			})
		}
	}

	static async getByPost(req, res) {
		try {
			// Validar ID del post
			const paramValidation = handleZodValidation(answerIdSchema, { id: req.params.postId })
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de post inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			// Validar parámetros de consulta para paginación
			const queryValidation = handleZodValidation(listAnswersQuerySchema, req.query)
			if (!queryValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'Parámetros de consulta inválidos',
					error: {
						details: queryValidation.errors,
					},
				})
			}

			const { page, limit } = queryValidation.data
			const result = await answerService.getAnswersByPost(paramValidation.data.id, { page, limit })

			const answersDTO = AnswerListDTO.fromArray(result.data)

			return sendResponse(res, {
				statusCode: 200,
				data: answersDTO,
				meta: {
					totalRecords: result.totalRecords,
					currentPage: result.currentPage,
					totalPages: result.totalPages,
				},
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al obtener respuestas del post',
			})
		}
	}

	static async get(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(answerIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de respuesta inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const answer = await answerService.getAnswerById(paramValidation.data.id)
			const answerDTO = new AnswerDetailDTO(answer)

			return sendResponse(res, {
				statusCode: 200,
				data: answerDTO,
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al obtener respuesta',
			})
		}
	}

	static async getMyAnswers(req, res) {
		try {
			// Validar parámetros de consulta
			const queryValidation = handleZodValidation(listAnswersQuerySchema, req.query)
			if (!queryValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'Parámetros de consulta inválidos',
					error: {
						details: queryValidation.errors,
					},
				})
			}

			const result = await answerService.getUserAnswers(req.user.id, queryValidation.data)
			const answersDTO = AnswerListDTO.fromArray(result.data)

			return sendResponse(res, {
				statusCode: 200,
				data: answersDTO,
				meta: {
					totalRecords: result.totalRecords,
					currentPage: result.currentPage,
					totalPages: result.totalPages,
				},
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al obtener mis respuestas',
			})
		}
	}

	static async update(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(answerIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de respuesta inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			// Validar datos de actualización
			const bodyValidation = handleZodValidation(updateAnswerSchema, req.body)
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
			const answer = await answerService.updateAnswer(
				paramValidation.data.id,
				bodyValidation.data.content,
				req.user.id,
				isAdmin
			)

			const answerDTO = new AnswerDetailDTO(answer)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Respuesta actualizada exitosamente',
				data: answerDTO,
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
			const paramValidation = handleZodValidation(answerIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de respuesta inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const isAdmin = req.user?.role === 'admin'
			await answerService.deleteAnswer(paramValidation.data.id, req.user.id, isAdmin, false)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Respuesta eliminada exitosamente',
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al eliminar respuesta',
			})
		}
	}

	static async hardDelete(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(answerIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de respuesta inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const isAdmin = req.user?.role === 'admin'
			await answerService.deleteAnswer(paramValidation.data.id, req.user.id, isAdmin, true)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Respuesta eliminada permanentemente',
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al eliminar respuesta permanentemente',
			})
		}
	}

	static async toggleLike(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(answerIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de respuesta inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const result = await answerService.toggleLike(paramValidation.data.id, req.user.id)

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

	static async checkLike(req, res) {
		try {
			const paramValidation = handleZodValidation(answerIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de respuesta inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const result = await answerService.checkUserLike(paramValidation.data.id, req.user?.id)

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

	static async restore(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(answerIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de respuesta inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const isAdmin = req.user?.role === 'admin'
			const answer = await answerService.restoreAnswer(paramValidation.data.id, req.user.id, isAdmin)
			const answerDTO = new AnswerDetailDTO(answer)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Respuesta restaurada exitosamente',
				data: answerDTO,
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al restaurar respuesta',
			})
		}
	}
}

export const answerController = new AnswerController()
