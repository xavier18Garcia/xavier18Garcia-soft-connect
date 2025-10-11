import jwt from 'jsonwebtoken'
import { env } from '../config/env-config.js'
import { TokenModel } from '../core/models/token-model.js'
import { UserModel } from '../core/models/user-model.js'
import { getSafeSequelize } from '../config/db/instances.js'
import { sendResponse } from '../common/helpers/responseHandler-helper.js'

export const Auth = async (req, res, next) => {
	try {
		const sequelize = await getSafeSequelize()
		const Token = TokenModel(sequelize)
		const User = UserModel(sequelize)

		const accessToken = req.cookies.accessToken

		if (!accessToken) {
			return sendResponse(res, {
				statusCode: 401,
				message: 'Acceso no autorizado',
			})
		}

		// Verificar que el token existe en la base de datos y no ha sido usado
		const tokenRecord = await Token.findOne({
			where: {
				token: accessToken,
				used: false,
				token_type: 'access',
			},
		})

		if (!tokenRecord) {
			return sendResponse(res, {
				statusCode: 401,
				message: 'Acceso no autorizado',
			})
		}

		// Verificar que el token no ha expirado en la base de datos
		if (new Date() > tokenRecord.expires_at) {
			return sendResponse(res, {
				statusCode: 401,
				message: 'Acceso no autorizado',
			})
		}

		// Verificar y decodificar el token JWT
		const decoded = jwt.verify(accessToken, env.JWT.SECRET)

		// Verificar que es un token de acceso
		if (decoded.type !== 'access') {
			return sendResponse(res, {
				statusCode: 401,
				message: 'Acceso no autorizado',
			})
		}

		const user = await User.findOne({
			where: { id: decoded.userId },
			attributes: ['id', 'role', 'status'],
		})

		if (!user) {
			return sendResponse(res, {
				statusCode: 401,
				message: 'Acceso no autorizado',
			})
		}

		// Añadir la información del usuario al request
		req.user = {
			id: decoded.userId,
			role: user.role,
			status: user.status,
			tokenType: decoded.type,
		}

		next()
	} catch (error) {
		console.error('Error en middleware de autenticación:', error)

		let statusCode = 500
		let message = 'Error en el servidor'

		if (error.name === 'JsonWebTokenError') {
			statusCode = 401
			message = 'Token inválido'
		} else if (error.name === 'TokenExpiredError') {
			statusCode = 401
			message = 'Token expirado'
		}

		return sendResponse(res, {
			statusCode,
			message,
		})
	}
}
