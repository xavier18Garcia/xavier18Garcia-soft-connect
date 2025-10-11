import { Router } from 'express'
import { Auth } from '../../middleware/auth-middleware.js'
import { UserController } from '../controllers/user-controller.js'
import { limiterRequest } from '../../middleware/rateLimit-middleware.js'
import { isAdmin } from '../../middleware/role-middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Rutas de gestión de usuarios
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Juan
 *               last_name:
 *                 type: string
 *                 example: Pérez
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: "Pass_123456"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 */
router.post('/', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, UserController.create)

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar usuarios con paginación
 *     tags: [Users]
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
 *         description: Buscar por nombre, apellido o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, student]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *     responses:
 *       200:
 *         description: Lista de usuarios con paginación
 */
router.get('/', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, isAdmin, UserController.list)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
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
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, UserController.get)

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar un usuario por ID
 *     tags: [Users]
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
 *               first_name:
 *                 type: string
 *                 example: Juan
 *               last_name:
 *                 type: string
 *                 example: Pérez
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: "Pass_123456"
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, UserController.update)

/**
 * @swagger
 * /users/{id}/soft:
 *   delete:
 *     summary: Eliminación lógica de un usuario (soft delete)
 *     tags: [Users]
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
 *         description: Usuario eliminado lógicamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id/soft', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, isAdmin, UserController.softDelete)

/**
 * @swagger
 * /users/{id}/hard:
 *   delete:
 *     summary: Eliminación permanente de un usuario (hard delete)
 *     tags: [Users]
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
 *         description: Usuario eliminado permanentemente
 *       403:
 *         description: Se requieren permisos de super administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id/hard', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, isAdmin, UserController.hardDelete)

export default router
