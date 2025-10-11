import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import { env } from '../../config/env-config.js'
import { getSafeSequelize } from '../../config/db/instances.js'
import { TokenModel } from '../models/token-model.js'
import { UserModel } from '../models/user-model.js'

class AuthService {
	constructor() {
		this.sequelize = null
		this.Token = null
		this.User = null
		this.initialized = false
	}

	async initialize() {
		if (this.initialized) return
		try {
			this.sequelize = await getSafeSequelize()

			// Inicializar modelos correctamente
			this.Token = TokenModel(this.sequelize)
			this.User = UserModel(this.sequelize)

			this.initialized = true
			console.log('✅ AuthService inicializado correctamente')
		} catch (error) {
			console.error('❌ Error inicializando AuthService:', error)
			throw new Error(`Service initialization failed: ${error.message}`)
		}
	}

	async login(email, password) {
		try {
			await this.initialize()
			const user = await this._login(email, password)
			return this._generateAuthTokens(user.id)
		} catch (error) {
			console.error('❌ Error in login:', error)
			throw error
		}
	}

	async register(email, password) {
		try {
			await this.initialize()

			// Verificar si el usuario ya existe
			const existingUser = await this.User.findOne({
				where: { email: email },
			})

			if (existingUser) throw { statusCode: 409, message: 'El usuario ya existe' }

			// Hashear la contraseña
			const hashedPassword = await this._hashPassword(password)

			// Crear el usuario
			const user = await this.User.create({
				email,
				password: hashedPassword,
			})

			// Generar tokens
			return this._generateAuthTokens(user.id)
		} catch (error) {
			console.error('❌ Error in register:', error)
			throw error
		}
	}

	async logout(refreshToken, accessToken) {
		await this.initialize()

		try {
			const decodedAccess = jwt.verify(accessToken, env.JWT.SECRET)
			const userId = decodedAccess.userId

			await this.Token.update(
				{ used: true },
				{
					where: {
						[Op.or]: [
							// Tokens específicos de esta sesión
							{ token: { [Op.in]: [refreshToken, accessToken] } },
							// Todos los tokens activos del usuario
							{
								user_fk: userId,
								used: false,
								token_type: { [Op.in]: ['access', 'refresh'] },
							},
						],
					},
				}
			)
		} catch (error) {
			console.error('❌ Error en logout:', error)
			// Si el token es inválido, simplemente limpiar las cookies
			if (error.name === 'JsonWebTokenError') {
				return // No hacer nada, solo limpiar cookies
			}
			throw error
		}
	}

	async refreshAccessToken(refreshToken) {
		await this.initialize()

		try {
			const decoded = jwt.verify(refreshToken, env.JWT.SECRET)

			if (decoded.type !== 'refresh') {
				throw { statusCode: 401, message: 'Token inválido' }
			}

			const tokenRecord = await this.Token.findOne({
				where: {
					token: refreshToken,
					used: false,
					expires_at: { [Op.gt]: new Date() },
				},
			})

			if (!tokenRecord) {
				throw { statusCode: 401, message: 'Token inválido o expirado' }
			}

			// Generar nuevo access token
			const accessToken = jwt.sign(
				{
					userId: decoded.userId,
					type: 'access',
				},
				env.JWT.SECRET,
				{ expiresIn: env.JWT.EXPIRED }
			)

			await this.Token.create({
				token: accessToken,
				user_fk: decoded.userId,
				token_type: 'access',
				expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
				used: false,
			})

			return {
				accessToken,
				user: {
					id: decoded.userId,
				},
			}
		} catch (error) {
			if (error.name === 'JsonWebTokenError') {
				throw { statusCode: 401, message: 'Token inválido' }
			}
			throw error
		}
	}

	/**
	 * Métodos privados
	 */
	async _generateAuthTokens(userId) {
		// Estructura simple y consistente para ambos tokens
		const accessToken = jwt.sign(
			{
				userId,
				type: 'access',
			},
			env.JWT.SECRET,
			{ expiresIn: env.JWT.EXPIRED }
		)

		const refreshToken = jwt.sign(
			{
				userId,
				type: 'refresh',
			},
			env.JWT.SECRET,
			{ expiresIn: env.JWT.REFRESH }
		)

		// Guardar tokens en la base de datos
		await this.Token.create({
			token: accessToken,
			user_fk: userId,
			token_type: 'access',
			expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 dia
			used: false,
		})

		await this.Token.create({
			token: refreshToken,
			user_fk: userId,
			token_type: 'refresh',
			expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
			used: false,
		})

		return {
			accessToken,
			refreshToken,
		}
	}

	async _login(email, password) {
		const user = await this.User.findOne({ where: { email } })

		if (!user) {
			throw { statusCode: 401, message: 'Credenciales inválidas' }
		}

		if (user.status !== 'active') {
			throw { statusCode: 403, message: 'Tu cuenta no está activa' }
		}

		const isValidPassword = await bcrypt.compare(password, user.password)
		if (!isValidPassword) {
			throw { statusCode: 401, message: 'Credenciales inválidas' }
		}

		return {
			id: user.id,
			email: user.email,
			role: user.role,
		}
	}

	/**
	 * Método auxiliar para crear hash de contraseña
	 */
	async _hashPassword(password) {
		const saltRounds = 12
		return await bcrypt.hash(password, saltRounds)
	}
}

export const authService = new AuthService()
