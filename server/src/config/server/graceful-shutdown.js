import { closeDatabase } from '../db/instances.js'

export const setupGracefulShutdown = server => {
	const shutdown = async signal => {
		console.log(`\n${signal} recibido, cerrando servidor...`)

		try {
			await new Promise(resolve => server.close(resolve))
			await Promise.allSettled([closeDatabase()])
			process.exit(0)
		} catch (error) {
			console.error('Error durante el cierre:', error)
			process.exit(1)
		}
	}

	process.on('SIGTERM', () => shutdown('SIGTERM'))
	process.on('SIGINT', () => shutdown('SIGINT'))
}
