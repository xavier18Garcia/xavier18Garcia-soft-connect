import { userService } from '../services/user-service.js'
import { UserListDTO, UserDetailDTO } from '../dto/user.dto.js'
import { sendResponse } from '../../common/helpers/responseHandler-helper.js'
import { handleZodValidation } from '../../common/utils/validationZod-util.js'
import { createUserSchema, updateUserSchema, listUsersQuerySchema, userIdSchema } from '../validators/user-validator.js'

export class UserController {
	static async create(req, res) {
		try {
			// Validar datos de entrada
			const validation = handleZodValidation(createUserSchema, req.body)
			if (!validation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'Datos de entrada inválidos',
					error: {
						details: validation.errors,
					},
				})
			}

			const user = await userService.createUser(validation.data)
			const userDTO = new UserDetailDTO(user)

			return sendResponse(res, {
				statusCode: 201,
				message: 'Usuario creado exitosamente',
				data: userDTO,
			})
		} catch (error) {
			// Manejo específico de errores conocidos
			let statusCode = 500
			let message = 'Error interno del servidor'

			if (error.statusCode) {
				statusCode = error.statusCode
				message = error.message
			} else if (error.name === 'SequelizeUniqueConstraintError') {
				statusCode = 409
				message = 'Ya existe un usuario con ese email'
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
			const queryValidation = handleZodValidation(listUsersQuerySchema, req.query)
			if (!queryValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'Parámetros de consulta inválidos',
					error: {
						details: queryValidation.errors,
					},
				})
			}

			const { search, status, role, page, limit } = queryValidation.data
			const isAdmin = req.user?.role === 'admin'

			const result = isAdmin
				? await userService.getUsersForAdmin({
						search,
						status,
						role,
						page,
						limit,
				  })
				: await userService.getUsers({
						search,
						status,
						role,
						page,
						limit,
				  })

			// Los DTOs filtran automáticamente los campos sensibles
			const usersDTO = UserListDTO.fromArray(result.data)

			return sendResponse(res, {
				statusCode: 200,
				data: usersDTO,
				meta: {
					totalRecords: result.totalRecords,
					currentPage: result.currentPage,
					totalPages: result.totalPages,
				},
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al obtener usuarios',
			})
		}
	}

	static async get(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(userIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de usuario inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const isAdmin = req.user?.role === 'admin'
			const user = isAdmin
				? await userService.getUserByIdForAdmin(paramValidation.data.id)
				: await userService.getUserById(paramValidation.data.id)

			// El DTO filtra automáticamente los campos sensibles
			const userDTO = new UserDetailDTO(user)

			return sendResponse(res, {
				statusCode: 200,
				data: userDTO,
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al obtener usuario',
			})
		}
	}

	static async update(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(userIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de usuario inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			// Validar datos de actualización
			const bodyValidation = handleZodValidation(updateUserSchema, req.body)
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
			const user = await userService.updateUser(paramValidation.data.id, bodyValidation.data, isAdmin)

			const userDTO = new UserDetailDTO(user)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Usuario actualizado exitosamente',
				data: userDTO,
			})
		} catch (error) {
			// Manejo específico de errores
			let statusCode = 500
			let message = 'Error interno del servidor'

			if (error.statusCode) {
				statusCode = error.statusCode
				message = error.message
			} else if (error.name === 'SequelizeUniqueConstraintError') {
				statusCode = 409
				message = 'Ya existe un usuario con ese email'
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
			const paramValidation = handleZodValidation(userIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de usuario inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const isAdmin = req.user?.role === 'admin'

			// Prevenir que los usuarios se eliminen a sí mismos
			if (req.user?.id === paramValidation.data.id) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'No puedes eliminarte a ti mismo',
				})
			}

			// Soft delete (comportamiento por defecto, hardDelete: false)
			await userService.deleteUser(paramValidation.data.id, isAdmin, false)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Usuario removido exitosamente',
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al eliminar usuario',
			})
		}
	}

	static async hardDelete(req, res) {
		try {
			// Validar ID del parámetro
			const paramValidation = handleZodValidation(userIdSchema, req.params)
			if (!paramValidation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'ID de usuario inválido',
					error: {
						details: paramValidation.errors,
					},
				})
			}

			const isAdmin = req.user?.role === 'admin'

			// Prevenir que los usuarios se eliminen a sí mismos
			if (req.user?.id === paramValidation.data.id) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'No puedes eliminarte a ti mismo',
				})
			}

			// Hard delete (eliminación física)
			await userService.deleteUser(paramValidation.data.id, true)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Usuario eliminado permanentemente',
			})
		} catch (error) {
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al eliminar usuario permanentemente',
			})
		}
	}
}

export const userController = new UserController()
