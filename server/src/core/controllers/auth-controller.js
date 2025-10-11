import { env } from '../../config/env-config.js'
import { authService } from '../services/auth-service.js'
import { loginSchema } from '../validators/auth-validator.js'
import { registerSchema } from '../validators/auth-validator.js'
import { sendResponse } from '../../common/helpers/responseHandler-helper.js'
import { handleZodValidation } from '../../common/utils/validationZod-util.js'
import { userService } from '../services/user-service.js'
import { UserDetailDTO } from '../dto/user.dto.js'

export class AuthController {
	static async login(req, res) {
		try {
			const validation = handleZodValidation(loginSchema, req.body)
			if (!validation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					error: {
						details: validation.errors,
					},
				})
			}

			const { email, password } = validation.data
			const result = await authService.login(email, password)

			AuthController._setAuthCookies(res, result)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Login exitoso',
				data: {
					accessToken: result.accessToken,
					refreshToken: result.refreshToken,
				},
			})
		} catch (error) {
			console.log(error)
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message,
			})
		}
	}

	static async register(req, res) {
		try {
			const validation = handleZodValidation(registerSchema, req.body)
			if (!validation.isValid) {
				return sendResponse(res, {
					statusCode: 400,
					error: {
						details: validation.errors,
					},
				})
			}

			const { email, password } = validation.data
			const result = await authService.register(email, password)

			AuthController._setAuthCookies(res, result)

			return sendResponse(res, {
				statusCode: 200,
				message: 'registro exitoso',
				data: {
					accessToken: result.accessToken,
					refreshToken: result.refreshToken,
				},
			})
		} catch (error) {
			console.log(error)
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message,
			})
		}
	}

	static async logout(req, res) {
		try {
			const { refreshToken, accessToken } = req.cookies

			if (!refreshToken || !accessToken) {
				return sendResponse(res, {
					statusCode: 400,
					message: 'No hay sesión activa',
				})
			}

			await authService.logout(refreshToken, accessToken)

			// Limpiar cookies
			res.clearCookie('accessToken')
			res.clearCookie('refreshToken')

			return sendResponse(res, {
				statusCode: 200,
				message: 'Logout exitoso',
			})
		} catch (error) {
			console.error('Error en logout:', error)
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message,
			})
		}
	}

	static async refreshToken(req, res) {
		try {
			const { refreshToken } = req.cookies

			if (!refreshToken) {
				return sendResponse(res, {
					statusCode: 401,
					message: 'No autorizado',
				})
			}

			const { accessToken, user } = await authService.refreshAccessToken(refreshToken)

			// Configurar nueva cookie de acceso
			res.cookie('accessToken', accessToken, {
				httpOnly: true,
				secure: env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 24 * 60 * 60 * 1000, // 1 dia
			})

			return sendResponse(res, {
				statusCode: 200,
				data: { user },
				message: 'Token actualizado',
			})
		} catch (error) {
			console.error('Error al refrescar token:', error)
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message,
				error: env.NODE_ENV === 'development' ? error.stack : undefined,
			})
		}
	}

	static async currentUser(req, res) {
		try {
			const userId = req.user.id

			if (!userId) {
				return sendResponse(res, {
					statusCode: 401,
					message: 'Usuario no encontrado',
				})
			}

			// Obtener datos completos del usuario
			const userFound = await userService.getUserById(userId)
			const userFoundDTO = new UserDetailDTO(userFound)

			return sendResponse(res, {
				statusCode: 200,
				message: 'Datos del usuario obtenidos correctamente',
				data: {
					...userFoundDTO,
				},
			})
		} catch (error) {
			console.error('Error al obtener usuario actual:', error)
			return sendResponse(res, {
				statusCode: error.statusCode || 500,
				message: error.message || 'Error al obtener datos del usuario',
			})
		}
	}

	/**
	 * Métodos privados
	 */
	static _setAuthCookies(res, { accessToken, refreshToken }) {
		// Cookie para access token (1 dia)
		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 24 * 60 * 60 * 1000,
		})

		// Cookie para refresh token (7 días)
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})
	}
}

export const authController = new AuthController()
