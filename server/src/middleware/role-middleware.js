import { userService } from '../core/services/user-service.js'
import { ROLES_ALLOW } from '../common/constants/roles-allow.js'
import { sendResponse } from '../common/helpers/responseHandler-helper.js'

/**
 * Middleware que verifica si el usuario tiene alguno de los roles especificados
 * @param {string|string[]} allowedRoles - Rol o array de roles permitidos
 * @returns {Function} Middleware de Express
 */
export const hasRole = allowedRoles => {
	return async (req, res, next) => {
		try {
			let user
			try {
				// Obtener los datos del usuario usando el servicio
				user = await userService.getUserById(req.user.id)
			} catch (serviceError) {
				// Si el usuario no existe en la base de datos
				if (serviceError.statusCode === 404) {
					return sendResponse(res, {
						statusCode: 401,
						message: 'Usuario no encontrado en el sistema',
					})
				}
				throw serviceError
			}

			// Convertir a array si es un string único
			const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

			// Verificar que el usuario tiene alguno de los roles permitidos
			if (!rolesArray.includes(user.role)) {
				return sendResponse(res, {
					statusCode: 403,
					message: `Acceso denegado. Se requieren permisos de: ${rolesArray.join(', ')}`,
					error: {
						requiredRoles: rolesArray,
						userRole: user.role,
					},
				})
			}

			// Enriquecer el objeto req.user con datos actualizados
			req.user.fullData = user.toJSON ? user.toJSON() : user

			next()
		} catch (error) {
			console.error('Error en middleware hasRole:', error)

			// Manejar errores específicos del servicio
			if (error.statusCode) {
				return sendResponse(res, {
					statusCode: error.statusCode,
					message: error.message || 'Error de autenticación',
				})
			}

			return sendResponse(res, {
				statusCode: 500,
				message: 'Error interno del servidor',
			})
		}
	}
}

// Middlewares preconfigurados
export const isAdmin = hasRole([ROLES_ALLOW.ADMIN])
export const isStudent = hasRole([ROLES_ALLOW.STUDENT])
