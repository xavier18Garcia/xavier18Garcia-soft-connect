import { Router } from 'express'
import { Auth } from '../../middleware/auth-middleware.js'
import { limiterRequest } from '../../middleware/rateLimit-middleware.js'
import { AnswerController } from '../controllers/answer-controller.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Answers
 *   description: Rutas de gestión de respuestas del foro
 */

/**
 * @swagger
 * /answers:
 *   get:
 *     summary: Listar respuestas con paginación y filtros
 *     tags: [Answers]
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
 *         name: postId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por post
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por autor
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en el contenido
 *     responses:
 *       200:
 *         description: Lista de respuestas con paginación
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
router.get('/', limiterRequest({ maxRequests: 100, time: '1m' }), AnswerController.list)

/**
 * @swagger
 * /answers/{id}:
 *   get:
 *     summary: Obtener una respuesta por ID
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         description: ID de la respuesta
 *     responses:
 *       200:
 *         description: Respuesta encontrada
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
 *                     content:
 *                       type: string
 *                     postId:
 *                       type: string
 *                     authorId:
 *                       type: string
 *                     likesCount:
 *                       type: integer
 *       404:
 *         description: Respuesta no encontrada
 */
router.get('/:id', limiterRequest({ maxRequests: 100, time: '1m' }), AnswerController.get)

/**
 * @swagger
 * /answers:
 *   post:
 *     summary: Crear una nueva respuesta
 *     tags: [Answers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - postId
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 10000
 *                 example: "Puedes optimizar tu código usando React.memo() para evitar re-renders innecesarios..."
 *               postId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       201:
 *         description: Respuesta creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos o post cerrado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Post no encontrado
 */
router.post('/', limiterRequest({ maxRequests: 30, time: '1m' }), Auth, AnswerController.create)

/**
 * @swagger
 * /answers/my/answers:
 *   get:
 *     summary: Obtener mis respuestas
 *     tags: [Answers]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de mis respuestas
 *       401:
 *         description: No autenticado
 */
router.get('/my/answers', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, AnswerController.getMyAnswers)

/**
 * @swagger
 * /answers/post/{postId}:
 *   get:
 *     summary: Obtener respuestas de un post específico
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         description: ID del post
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
 *     responses:
 *       200:
 *         description: Lista de respuestas del post
 *       400:
 *         description: ID de post inválido
 */
router.get('/post/:postId', limiterRequest({ maxRequests: 100, time: '1m' }), AnswerController.getByPost)

/**
 * @swagger
 * /answers/{id}:
 *   put:
 *     summary: Actualizar una respuesta
 *     tags: [Answers]
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
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 10000
 *                 example: "Contenido actualizado de la respuesta..."
 *     responses:
 *       200:
 *         description: Respuesta actualizada exitosamente
 *       400:
 *         description: Datos inválidos o post cerrado
 *       403:
 *         description: No tienes permiso para actualizar esta respuesta
 *       404:
 *         description: Respuesta no encontrada
 */
router.put('/:id', limiterRequest({ maxRequests: 30, time: '1m' }), Auth, AnswerController.update)

/**
 * @swagger
 * /answers/{id}/soft:
 *   delete:
 *     summary: Eliminación lógica de una respuesta (soft delete)
 *     tags: [Answers]
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
 *         description: Respuesta eliminada exitosamente
 *       403:
 *         description: No tienes permiso para eliminar esta respuesta
 *       404:
 *         description: Respuesta no encontrada
 */
router.delete('/:id/soft', limiterRequest({ maxRequests: 30, time: '1m' }), Auth, AnswerController.softDelete)

/**
 * @swagger
 * /answers/{id}/hard:
 *   delete:
 *     summary: Eliminación permanente de una respuesta (hard delete)
 *     tags: [Answers]
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
 *         description: Respuesta eliminada permanentemente
 *       403:
 *         description: No tienes permiso
 *       404:
 *         description: Respuesta no encontrada
 */
router.delete('/:id/hard', limiterRequest({ maxRequests: 30, time: '1m' }), Auth, AnswerController.hardDelete)

/**
 * @swagger
 * /answers/{id}/restore:
 *   post:
 *     summary: Restaurar una respuesta eliminada (soft delete)
 *     tags: [Answers]
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
 *         description: Respuesta restaurada exitosamente
 *       400:
 *         description: La respuesta no está eliminada
 *       403:
 *         description: No tienes permiso para restaurar esta respuesta
 *       404:
 *         description: Respuesta no encontrada
 */
router.post('/:id/restore', limiterRequest({ maxRequests: 30, time: '1m' }), Auth, AnswerController.restore)

/**
 * @swagger
 * /answers/{id}/like:
 *   post:
 *     summary: Dar/quitar like a una respuesta
 *     tags: [Answers]
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
 *         description: Respuesta no encontrada
 */
router.post('/:id/like', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, AnswerController.toggleLike)

/**
 * @swagger
 * /answers/{id}/check-like:
 *   get:
 *     summary: Verificar si el usuario actual dio like a una respuesta
 *     tags: [Answers]
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
 *                       description: Indica si el usuario actual dio like a la respuesta
 *                     likeId:
 *                       type: string
 *                       format: uuid
 *                       description: ID del like (si existe)
 *       400:
 *         description: ID de respuesta inválido
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Respuesta no encontrada
 */
router.get('/:id/check-like', limiterRequest({ maxRequests: 100, time: '1m' }), Auth, AnswerController.checkLike)

export default router
