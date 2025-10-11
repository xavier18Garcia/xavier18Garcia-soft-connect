import { Router } from 'express'
import { PostController } from '../controllers/post-controller.js'
import { Auth } from '../../middleware/auth-middleware.js'
import { limiterRequest } from '../../middleware/rateLimit-middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Rutas de gestión de posts/preguntas del foro
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Listar posts con paginación y filtros
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por título o descripción
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, closed, deleted]
 *           default: active
 *         description: Filtrar por estado
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por autor
 *     responses:
 *       200:
 *         description: Lista de posts con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', limiterRequest({ maxRequests: 100, time: '1m' }), PostController.list)

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Obtener un post por ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         description: ID del post
 *     responses:
 *       200:
 *         description: Post encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     views:
 *                       type: integer
 *                     likesCount:
 *                       type: integer
 *                     answersCount:
 *                       type: integer
 *                     isSolved:
 *                       type: boolean
 *       404:
 *         description: Post no encontrado
 */
router.get('/:id', limiterRequest({ maxRequests: 100, time: '1m' }), PostController.get)

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Crear un nuevo post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 200
 *                 example: "¿Cómo puedo optimizar mi código React?"
 *               description:
 *                 type: string
 *                 example: "<p>Tengo un componente que se renderiza muchas veces...</p>"
 *     responses:
 *       201:
 *         description: Post creado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autenticado
 */
router.post('/', limiterRequest({ maxRequests: 30, time: '1m' }), Auth, PostController.create)

/**
 * @swagger
 * /posts/my/posts:
 *   get:
 *     summary: Obtener mis posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, closed, deleted]
 *           default: active
 *     responses:
 *       200:
 *         description: Lista de mis posts
 *       401:
 *         description: No autenticado
 */
router.get('/my/posts', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, PostController.getMyPosts)

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Actualizar un post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 200
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permiso para actualizar este post
 *       404:
 *         description: Post no encontrado
 */
router.put('/:id', limiterRequest({ maxRequests: 30, time: '1m' }), Auth, PostController.update)

/**
 * @swagger
 * /posts/{id}/soft:
 *   delete:
 *     summary: Eliminación lógica de un post (soft delete)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Post eliminado exitosamente
 *       403:
 *         description: No tienes permiso para eliminar este post
 *       404:
 *         description: Post no encontrado
 */
router.delete('/:id/soft', limiterRequest({ maxRequests: 30, time: '1m' }), Auth, PostController.softDelete)

/**
 * @swagger
 * /posts/{id}/hard:
 *   delete:
 *     summary: Eliminación permanente de un post (hard delete)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Post eliminado permanentemente
 *       403:
 *         description: No tienes permiso
 *       404:
 *         description: Post no encontrado
 */
router.delete('/:id/hard', limiterRequest({ maxRequests: 30, time: '1m' }), Auth, PostController.hardDelete)

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Dar/quitar like a un post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Like actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     likesCount:
 *                       type: integer
 *                     isLiked:
 *                       type: boolean
 *       404:
 *         description: Post no encontrado
 */
router.post('/:id/like', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, PostController.toggleLike)

/**
 * @swagger
 * /posts/{id}/check-like:
 *   get:
 *     summary: Verificar si el usuario actual dio like a un post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Estado del like obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasLiked:
 *                       type: boolean
 *                       description: Indica si el usuario actual dio like al post
 *                     likeId:
 *                       type: string
 *                       format: uuid
 *                       description: ID del like (si existe)
 *       400:
 *         description: ID de post inválido
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Post no encontrado
 */
router.get('/:id/check-like', limiterRequest({ maxRequests: 100, time: '1m' }), Auth, PostController.checkLike)

/**
 * @swagger
 * /posts/{id}/solved:
 *   patch:
 *     summary: Marcar/desmarcar post como resuelto
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       403:
 *         description: Solo el autor puede marcar como resuelto
 *       404:
 *         description: Post no encontrado
 */
router.patch('/:id/solved', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, PostController.markAsSolved)

export default router
