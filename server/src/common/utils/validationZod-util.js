export const handleZodValidation = (schema, data) => {
	const result = schema.safeParse(data)

	if (!result.success) {
		const errorsByField = {}

		result.error.issues.forEach(err => {
			const fieldName = err.path.join('.')

			if (!errorsByField[fieldName]) {
				errorsByField[fieldName] = {
					field: fieldName,
					messages: [],
				}
			}

			errorsByField[fieldName].messages.push(err.message)
		})

		// Convertir a array y formatear
		const formattedErrors = Object.values(errorsByField).map(fieldError => ({
			field: fieldError.field,
			messages: fieldError.messages,
		}))

		return {
			isValid: false,
			errors: formattedErrors,
		}
	}

	return {
		isValid: true,
		data: result.data,
	}
}
