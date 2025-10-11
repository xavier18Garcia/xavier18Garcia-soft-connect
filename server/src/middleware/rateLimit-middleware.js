import rateLimit from 'express-rate-limit'
import { parseWindowMs } from '../common/utils/time-util.js'

const limiterRequest = ({ maxRequests = 60, time = '1m' } = {}) => {
	const windowMsInMilliseconds = parseWindowMs(time)

	return rateLimit({
		time: windowMsInMilliseconds,
		max: maxRequests,
		message: {
			success: false,
			statusCode: 429,
			message: `Ooooh! Más despacio velocista - ${time}`,
		},
		keyGenerator: req => req.ip,
	})
}

export { limiterRequest }
