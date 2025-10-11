import { Router } from 'express'
import { Auth } from '../../middleware/auth-middleware.js'
import { AuthController } from '../controllers/auth-controller.js'
import { limiterRequest } from '../../middleware/rateLimit-middleware.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Rutas de autenticación
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@dominio.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', limiterRequest({ maxRequests: 60, time: '1m' }), AuthController.login)

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@ueb.edu.ec
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Regsitro exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/register', limiterRequest({ maxRequests: 60, time: '1m' }), AuthController.register)

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refrescar el token JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refrescado correctamente
 *       403:
 *         description: Token inválido o expirado
 */

router.post('/refresh-token', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, AuthController.refreshToken)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
router.post('/logout', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, AuthController.logout)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener datos del usuario actual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario obtenidos correctamente
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         status:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *       401:
 *         description: No autorizado
 */
router.get('/me', limiterRequest({ maxRequests: 60, time: '1m' }), Auth, AuthController.currentUser)

export default router
