import app from './config/app-config.js'
import { closeDatabase } from './config/db/instances.js'
import { startServer } from './config/server/server.js'
import { initializeAllDatabases } from './config/server/database.js'
import { setupGracefulShutdown } from './config/server/graceful-shutdown.js'

export const bootstrap = async () => {
	try {
		await initializeAllDatabases()
		const server = await startServer(app)
		setupGracefulShutdown(server)
	} catch (error) {
		console.error('\n❌ Error durante la inicialización:', error)
		await Promise.allSettled([closeDatabase()])
		process.exit(1)
	}
}

bootstrap()
