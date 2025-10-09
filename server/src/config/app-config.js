import express from 'express'
import { setupRoutes } from '../routes.js'
import { miscMiddlewares } from '../middleware/misc-middleware.js'

const app = express()
miscMiddlewares(app)
setupRoutes(app)

export default app
