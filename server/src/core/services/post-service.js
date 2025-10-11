import { Op } from 'sequelize'
import { getModels, initializeModels } from '../models/_index.js'

class PostService {
	constructor() {
		this.models = null
		this.initialized = false
	}

	async initialize() {
		if (this.initialized) return
		try {
			this.models = await initializeModels()
			this.initialized = true
			console.log('✅ PostService inicializado correctamente')
		} catch (error) {
			console.error('❌ Error inicializando PostService:', error)
			throw error
		}
	}

	// Crear post
	async createPost(data, authorId) {
		await this.initialize()

		const postData = {
			...data,
			author_id: authorId,
		}

		const post = await this.models.Post.create(postData)

		// Cargar la relación del autor
		return await this.getPostById(post.id)
	}

	// Obtener posts con filtros
	async getPosts({ search, status, is_solved, page = 1, limit = 10, authorId } = {}) {
		await this.initialize()

		const where = {}

		if (status && status.trim() !== '') where.status = status

		if (is_solved) where.is_solved = is_solved

		// Filtro por autor
		if (authorId) where.author_id = authorId

		// Búsqueda por texto
		if (search) {
			const searchTerm = search.trim()
			where[Op.or] = [{ title: { [Op.iLike]: `%${searchTerm}%` } }, { description: { [Op.iLike]: `%${searchTerm}%` } }]
		}

		const offset = (page - 1) * limit

		const { rows, count } = await this.models.Post.findAndCountAll({
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

	// Obtener post por ID
	async getPostById(id, includeDeleted = false, incrementView = false) {
		await this.initialize()

		const options = {
			where: { id },
			include: [
				{
					model: this.models.User,
					as: 'author',
					attributes: ['id', 'first_name', 'last_name', 'email'],
				},
			],
			paranoid: !includeDeleted,
		}

		const post = await this.models.Post.findOne(options)
		if (!post) throw { statusCode: 404, message: 'Post no encontrado' }

		// Incrementar vistas si se solicita
		if (incrementView && post.status === 'active') {
			await post.increment('views')
			await post.reload()
		}

		return post
	}

	// Resto de los métodos permanecen igual, solo cambia this.Post por this.models.Post
	async updatePost(id, data, userId, isAdmin = false) {
		await this.initialize()
		const post = await this.getPostById(id)

		if (!isAdmin && post.author_id !== userId)
			throw { statusCode: 403, message: 'No tienes permiso para actualizar este post' }

		await post.update(data)
		return await this.getPostById(id)
	}

	async deletePost(id, userId, isAdmin = false, hardDelete = false) {
		await this.initialize()
		const post = await this.getPostById(id, true)

		if (!isAdmin && post.author_id !== userId)
			throw { statusCode: 403, message: 'No tienes permiso para eliminar este post' }

		if (hardDelete) {
			return await this.models.Post.destroy({
				where: { id },
				force: true,
			})
		} else {
			return await post.destroy()
		}
	}

	async toggleLike(postId, userId) {
		await this.initialize()

		// Buscar si ya existe un like del usuario para este post
		const existingLike = await this.models.Like.findOne({
			where: {
				post_id: postId,
				user_id: userId,
			},
		})

		const post = await this.getPostById(postId)

		if (existingLike) {
			// Si ya existe like, lo eliminamos (toggle off)
			await existingLike.destroy()
			await post.decrement('likes_count')
			await post.reload()

			return {
				likesCount: post.likes_count,
				isLiked: false,
			}
		} else {
			// Si no existe like, lo creamos (toggle on)
			await this.models.Like.create({
				post_id: postId,
				user_id: userId,
			})
			await post.increment('likes_count')
			await post.reload()

			return {
				likesCount: post.likes_count,
				isLiked: true,
			}
		}
	}

	async markAsSolved(id, userId) {
		await this.initialize()
		const post = await this.getPostById(id)

		if (post.author_id !== userId)
			throw { statusCode: 403, message: 'Solo el autor puede marcar el post como resuelto' }

		await post.update({ is_solved: !post.is_solved })
		return await this.getPostById(id)
	}

	async getUserPosts(userId, params) {
		return this.getPosts({ ...params, authorId: userId })
	}

	async incrementAnswersCount(postId) {
		await this.initialize()
		const post = await this.getPostById(postId)
		await post.increment('answers_count')
		return post.reload()
	}

	async checkUserLike(postId, userId) {
		await this.initialize()

		if (!userId) return { hasLiked: false }

		// Buscar si existe un like del usuario para este post
		const existingLike = await this.models.Like.findOne({
			where: {
				post_id: postId,
				user_id: userId,
			},
		})

		return {
			hasLiked: !!existingLike,
			likeId: existingLike?.id,
		}
	}
}

export const postService = new PostService()
