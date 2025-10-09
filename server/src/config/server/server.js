import { env } from '../env-config.js'

export const startServer = app => {
	return new Promise(resolve => {
		const server = app.listen(env.PORT, () => {
			console.log(`\n🚀 Servidor listo en ${env.SERVER_URL}:${env.PORT}`)
			console.log(`⏱️ ${new Date().toLocaleString()}\n`)
			resolve(server)
		})
	})
}
