import jwt from 'jsonwebtoken'
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../configs/env.js'
async function createAccessToken(userObj) {
	try {
		if (typeof userObj !== 'object' || userObj === null || Array.isArray(userObj)) {
			throw new Error('userObj must be a plain object')
		}
		const token = jwt.sign(userObj, JWT_ACCESS_SECRET)
		return token
	} catch (err) {
		console.error('Token creation error:', err)
		throw err
	}
}

async function createRefreshToken(userObj) {
	try {
		if (typeof userObj !== 'object' || userObj === null || Array.isArray(userObj)) {
			throw new Error('userObj must be a plain object')
		}
		const token = jwt.sign(userObj, JWT_REFRESH_SECRET)
		return token
	} catch (err) {
		console.error('Token creation error:', err)
		throw err
	}
}

export { createAccessToken, createRefreshToken }
