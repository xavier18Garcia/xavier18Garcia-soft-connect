import jwt from 'jsonwebtoken'
import { env } from '../../config/env-config'

export function createAccessToken(payload) {
	return new Promise((resolve, reject) => {
		jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRED }, (err, token) => {
			if (err) reject(err)
			resolve(token)
		})
	})
}

export function createRefreshToken(payload) {
	return new Promise((resolve, reject) => {
		jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH }, (err, token) => {
			if (err) reject(err)
			resolve(token)
		})
	})
}

export function convertJwtRefreshToMilliseconds(jwtRefreshValue) {
	const days = parseInt(jwtRefreshValue)
	if (isNaN(days)) throw new Error('El valor de JWT_REFRESH no es válido.')
	return days * 24 * 60 * 60 * 1000
}

export const isTokenExpired = token => {
	const arrayToken = token.split('.')
	const tokenPayload = JSON.parse(Buffer.from(arrayToken[1], 'base64').toString())
	const currentTime = Math.floor(Date.now() / 1000)
	return currentTime >= tokenPayload.exp
}
