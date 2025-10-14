import { swaggerDocs } from './swagger.js'
import { API_VS } from './common/constants/prefixAPi-const.js'

import authRouter from './core/routes/auth-route.js'
import usersRouter from './core/routes/user-route.js'
import postsRouter from './core/routes/post-route.js'
import answersRouter from './core/routes/answer-route.js'

export const setupRoutes = app => {
	app.use(API_VS + '/auth', authRouter)
	app.use(API_VS + '/users', usersRouter)
	app.use(API_VS + '/posts', postsRouter)
	app.use(API_VS + '/answers', answersRouter)
	swaggerDocs(app)
}
