import moment from 'moment-timezone'

export const getDateNow = () => moment().format('DD/MM/YYYY HH:mm')

export const formattedDate = new Date().toLocaleDateString('es-ES', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
})

export const parseWindowMs = time => {
	if (typeof time === 'string') {
		const match = time.match(/^(\d+)(s|m|h)$/)
		if (!match)
			throw new Error("Formato inválido. Usa un número seguido de 's', 'm', o 'h' (ejemplo: '5s', '10m', '1h').")

		const value = parseInt(match[1], 10)
		const unit = match[2]

		switch (unit) {
			case 's':
				return value * 1000
			case 'm':
				return value * 60 * 1000
			case 'h':
				return value * 60 * 60 * 1000
			default:
				throw new Error('Unidad de tiempo no soportada.')
		}
	}
	if (typeof time === 'number') return time
	throw new Error("El valor de 'time' debe ser un número o una cadena (ejemplo: '5s', '10m', '1h').")
}

export const formatISOToDate = (isoDate, timezone = 'America/Guayaquil') => {
	return moment(isoDate).tz(timezone).format('DD/MM/YYYY HH:mm')
}
