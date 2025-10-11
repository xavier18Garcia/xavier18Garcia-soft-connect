import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import { UserModel } from '../models/user-model.js'
import { getSafeSequelize } from '../../config/db/instances.js'
import { hashPassword } from '../../common/helpers/bcrypt-helper.js'

class UserService {
	constructor() {
		this.sequelize = null
		this.User = null
		this.initialized = false
	}

	async initialize() {
		if (this.initialized) return
		try {
			this.sequelize = await getSafeSequelize()
			this.User = UserModel(this.sequelize)
			this.initialized = true
			console.log('✅ UserService inicializado correctamente')
		} catch (error) {
			console.error('❌ Error inicializando UserService:', error)
			throw error
		}
	}

	// Método para verificar si un email ya existe
	async emailExists(email, excludeId = null) {
		await this.initialize()
		const where = { email: email.toLowerCase().trim() }

		// Excluir un ID específico (útil para updates)
		if (excludeId) where.id = { [Op.ne]: excludeId }

		const existingUser = await this.User.findOne({ where }) // <- Usar this.User
		return !!existingUser
	}

	// Crear usuario
	async createUser(data) {
		await this.initialize()

		// Validar email único
		const emailToCheck = data.email?.toLowerCase().trim()

		const emailAlreadyExists = await this.emailExists(emailToCheck)
		if (emailAlreadyExists) throw { statusCode: 409, message: 'Este email ya está registrado' }

		// Hashear la contraseña
		let hashedPassword = null
		if (data.password) hashedPassword = await hashPassword(data.password)

		// Preparar datos del usuario
		const userData = {
			...data,
			email: emailToCheck,
			...(hashedPassword && { password: hashedPassword }),
		}

		return this.User.create(userData) // <- Usar this.User
	}

	// Obtener usuarios con filtros
	async getUsers({ search, status, role, page = 1, limit = 10, includeAdmin = false } = {}) {
		await this.initialize()
		const where = {}

		// Excluir usuarios admin por defecto
		if (!includeAdmin) where.role = { [Op.ne]: 'admin' }

		if (search) {
			const searchTerm = search.trim()
			const searchCondition = {
				[Op.or]: [
					{ first_name: { [Op.iLike]: `%${searchTerm}%` } },
					{ last_name: { [Op.iLike]: `%${searchTerm}%` } },
					{ email: { [Op.iLike]: `%${searchTerm}%` } },
				],
			}

			// Si ya hay condiciones, las combinamos con AND
			if (Object.keys(where).length > 0) {
				where[Op.and] = [searchCondition]
			} else {
				Object.assign(where, searchCondition)
			}
		}

		if (status) where.status = status
		if (role && role !== 'admin') where.role = role

		const offset = (page - 1) * limit

		const { rows, count } = await this.User.findAndCountAll({
			// <- Usar this.User
			where,
			limit,
			offset,
			order: [['createdAt', 'DESC']],
		})

		return {
			data: rows,
			totalRecords: count,
			currentPage: page,
			totalPages: Math.ceil(count / limit),
		}
	}

	// Obtener usuario por ID
	async getUserById(id, includeDeleted = false) {
		await this.initialize()
		const where = { id }

		const options = {
			where,
			paranoid: !includeDeleted,
		}

		const user = await this.User.findOne(options) // <- Usar this.User
		if (!user) throw { statusCode: 404, message: 'Usuario no encontrado' }
		return user
	}

	// Actualizar usuario
	async updateUser(id, data, includeAdmin = false) {
		await this.initialize()
		const user = await this.getUserById(id)

		// Preparar datos de actualización
		const updateData = { ...data }

		// Si se está actualizando el email, validar unicidad
		if (updateData.email) {
			const emailToCheck = updateData.email.toLowerCase().trim()
			const emailAlreadyExists = await this.emailExists(emailToCheck, id)

			if (emailAlreadyExists) throw { statusCode: 409, message: 'Este email ya está en uso por otro usuario' }

			// Normalizar email
			updateData.email = emailToCheck
		}

		// Si se está actualizando la contraseña, hashearla
		if (updateData.password) updateData.password = await hashPassword(updateData.password)

		return user.update(updateData)
	}

	// Método para ambos tipos de eliminación (soft - hard)
	async deleteUser(id, hardDelete = false) {
		await this.initialize()

		const user = await this.getUserById(id, true)

		if (!user) throw new Error('Usuario no encontrado')

		if (hardDelete) {
			// Hard delete
			return await this.User.destroy({
				// <- Usar this.User
				where: { id },
				force: true,
			})
		} else {
			// Soft delete (comportamiento por defecto)
			return await user.destroy()
		}
	}

	async getUserByField(field, value, includeAdmin = false) {
		await this.initialize()

		const where = {
			[field]: typeof value === 'string' ? value.toLowerCase().trim() : value,
		}

		if (!includeAdmin) where.role = { [Op.ne]: 'admin' }

		const user = await this.User.findOne({ where }) // <- Usar this.User
		return user
	}

	// Método especial para administradores - obtener usuarios
	async getUsersForAdmin(params) {
		return this.getUsers({ ...params, includeAdmin: true })
	}

	// Método especial para administradores - obtener usuario por ID
	async getUserByIdForAdmin(id) {
		return this.getUserById(id, true)
	}

	// Método para cambiar contraseña (requiere contraseña actual)
	async changePassword(userId, currentPassword, newPassword, includeAdmin = false) {
		await this.initialize()

		const user = await this.getUserById(userId, includeAdmin)

		// Verificar contraseña actual
		const isCurrentPasswordValid = await comparePassword(currentPassword, user.password)
		if (!isCurrentPasswordValid) throw { statusCode: 400, message: 'La contraseña actual es incorrecta' }

		// Hashear nueva contraseña
		const hashedNewPassword = await hashPassword(newPassword)

		// Actualizar contraseña
		return user.update({ password: hashedNewPassword })
	}
}

export const userService = new UserService()
