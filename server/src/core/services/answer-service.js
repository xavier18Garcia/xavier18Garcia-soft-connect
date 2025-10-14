import { Op } from 'sequelize'
import { initializeModels } from '../models/_index.js'

class AnswerService {
	constructor() {
		this.models = null
		this.initialized = false
	}

	async initialize() {
		if (this.initialized) return
		try {
			this.models = await initializeModels()
			this.initialized = true
			console.log('✅ AnswerService inicializado correctamente')
		} catch (error) {
			console.error('❌ Error inicializando AnswerService:', error)
			throw error
		}
	}

	// Crear respuesta
	async createAnswer(content, authorId, postId) {
		await this.initialize()

		// Verificar que el post existe y está activo
		const post = await this.models.Post.findByPk(postId)
		if (!post) throw { statusCode: 404, message: 'Post no encontrado' }

		if (post.status === 'closed')
			throw { statusCode: 400, message: 'No se pueden agregar respuestas a un post cerrado' }

		const answerData = {
			content,
			author_id: authorId,
			post_id: postId,
		}

		const answer = await this.models.Answer.create(answerData)

		// Incrementar el contador de respuestas del post
		await post.increment('answers_count')

		// Cargar la relación del autor
		return await this.getAnswerById(answer.id)
	}

	// Obtener respuestas con filtros
	async getAnswers({ postId, authorId, search, page = 1, limit = 10, includeDeleted = false } = {}) {
		await this.initialize()

		const where = {}

		// Filtro por post
		if (postId) where.post_id = postId

		// Filtro por autor
		if (authorId) where.author_id = authorId

		// Búsqueda por texto
		if (search) {
			const searchTerm = search.trim()
			where.content = { [Op.iLike]: `%${searchTerm}%` }
		}

		const offset = (page - 1) * limit

		const { rows, count } = await this.models.Answer.findAndCountAll({
			paranoid: !includeDeleted,
			where,
			limit,
			offset,
			include: [
				{
					model: this.models.User,
					as: 'author',
					attributes: ['id', 'first_name', 'last_name', 'email'],
				},
			],
			order: [['created_at', 'DESC']],
		})

		return {
			data: rows,
			totalRecords: count,
			currentPage: page,
			totalPages: Math.ceil(count / limit),
		}
	}

	// Obtener respuestas por post (para mostrar en detalle del post)
	async getAnswersByPost(postId, { page = 1, limit = 10, includeDeleted = false } = {}) {
		return this.getAnswers({ postId, page, limit, includeDeleted })
	}

	// Obtener respuesta por ID
	async getAnswerById(id, includeDeleted = false) {
		await this.initialize()

		const options = {
			paranoid: !includeDeleted,
			where: { id },
			include: [
				{
					model: this.models.User,
					as: 'author',
					attributes: ['id', 'first_name', 'last_name', 'email'],
				},
				{
					model: this.models.Post,
					as: 'post',
					attributes: ['id', 'title', 'status', 'author_id'],
				},
			],
		}

		const answer = await this.models.Answer.findOne(options)
		if (!answer) throw { statusCode: 404, message: 'Respuesta no encontrada' }

		return answer
	}

	// Actualizar respuesta
	async updateAnswer(id, content, userId, isAdmin = false) {
		await this.initialize()
		const answer = await this.getAnswerById(id)

		// Solo el autor o un admin pueden actualizar
		if (!isAdmin && answer.author_id !== userId)
			throw { statusCode: 403, message: 'No tienes permiso para actualizar esta respuesta' }

		// Verificar que el post no esté cerrado
		if (answer.post.status === 'closed' && !isAdmin)
			throw { statusCode: 400, message: 'No se pueden editar respuestas en posts cerrados' }

		await answer.update({ content })
		return await this.getAnswerById(id)
	}

	// Eliminar respuesta
	async deleteAnswer(id, userId, isAdmin = false, hardDelete = false) {
		await this.initialize()
		const answer = await this.getAnswerById(id, true)

		// Solo el autor, el dueño del post, o un admin pueden eliminar
		const isPostOwner = answer.post.author_id === userId
		if (!isAdmin && answer.author_id !== userId && !isPostOwner)
			throw { statusCode: 403, message: 'No tienes permiso para eliminar esta respuesta' }

		const postId = answer.post_id

		if (hardDelete) {
			await this.models.Answer.destroy({
				where: { id },
				force: true,
			})
		} else {
			await answer.destroy()
		}

		// Decrementar el contador de respuestas del post
		const post = await this.models.Post.findByPk(postId)
		if (post) await post.decrement('answers_count')

		return { message: 'Respuesta eliminada correctamente' }
	}

	// Toggle like en respuesta
	async toggleLike(answerId, userId) {
		await this.initialize()

		// Verificar que la respuesta existe
		const answer = await this.getAnswerById(answerId)

		// Buscar si ya existe un like del usuario para esta respuesta
		const existingLike = await this.models.Like.findOne({
			where: {
				answer_id: answerId,
				user_id: userId,
			},
		})

		if (existingLike) {
			// Si ya existe like, lo eliminamos (toggle off)
			await existingLike.destroy()

			// Contar likes actuales
			const likesCount = await this.models.Like.count({
				where: { answer_id: answerId },
			})

			return {
				likesCount,
				isLiked: false,
			}
		} else {
			// Si no existe like, lo creamos (toggle on)
			await this.models.Like.create({
				answer_id: answerId,
				user_id: userId,
			})

			// Contar likes actuales
			const likesCount = await this.models.Like.count({
				where: { answer_id: answerId },
			})

			return {
				likesCount,
				isLiked: true,
			}
		}
	}

	// Verificar si el usuario dio like a una respuesta
	async checkUserLike(answerId, userId) {
		await this.initialize()

		if (!userId) return { hasLiked: false }

		// Buscar si existe un like del usuario para esta respuesta
		const existingLike = await this.models.Like.findOne({
			where: {
				answer_id: answerId,
				user_id: userId,
			},
		})

		return {
			hasLiked: !!existingLike,
			likeId: existingLike?.id,
		}
	}

	// Obtener respuestas de un usuario
	async getUserAnswers(userId, params) {
		return this.getAnswers({ ...params, authorId: userId })
	}

	// Obtener cantidad de likes de una respuesta
	async getAnswerLikesCount(answerId) {
		await this.initialize()

		const count = await this.models.Like.count({
			where: { answer_id: answerId },
		})

		return { likesCount: count }
	}

	// Restaurar respuesta eliminada (soft delete)
	async restoreAnswer(id, userId, isAdmin = false) {
		await this.initialize()

		const answer = await this.getAnswerById(id, true)

		if (!answer.deleted_at) throw { statusCode: 400, message: 'La respuesta no está eliminada' }

		// Solo el autor o admin pueden restaurar
		if (!isAdmin && answer.author_id !== userId)
			throw { statusCode: 403, message: 'No tienes permiso para restaurar esta respuesta' }

		await answer.restore()

		// Incrementar el contador de respuestas del post
		const post = await this.models.Post.findByPk(answer.post_id)
		if (post) await post.increment('answers_count')

		return await this.getAnswerById(id)
	}
}

export const answerService = new AnswerService()
