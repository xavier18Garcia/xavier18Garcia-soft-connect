export const sendResponse = (res, options) => {
	const {
		statusCode,
		message = '',
		data = null,
		meta = null,
		error = null,
		errors = null,
		defaultMessages = {
			200: 'Operación exitosa',
			201: 'Recurso creado exitosamente',
			400: 'Solicitud inválida',
			401: 'Autenticación requerida',
			403: 'No tienes permiso para esta acción',
			404: 'Recurso no encontrado',
			500: 'Error interno del servidor',
		},
	} = options

	const finalMessage = message || defaultMessages[statusCode] || '¡Ops! Ha ocurrido un error. Inténtalo más tarde.'

	const response = {
		status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
		code: statusCode,
		message: finalMessage,
	}

	// Agregar propiedades adicionales solo si existen
	if (error) response.error = error
	if (errors) response.errors = errors
	if (data !== null && !(typeof data === 'object' && Object.keys(data).length === 0)) response.data = data
	if (meta !== null && !(typeof meta === 'object' && Object.keys(meta).length === 0)) response.meta = meta

	return res.status(statusCode).json(response)
}
