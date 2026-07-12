import { JWT_ACCESS_SECRET } from '../configs/env.js'
import jwt from 'jsonwebtoken'
import prisma from '../db/prisma.js'

const authorizationMiddleware = async (req, res, next) => {
	const token = req.cookies.token
	if (!token) {
		return res.status(401).json({ message: 'Unauthorized' })
	}

	try {
		const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as jwt.JwtPayload & { userId?: string }

		if (!decoded.userId) {
			return res.status(401).json({ message: 'Invalid token' })
		}

		const user = await prisma.user.findUnique({ where: { id: decoded.userId } })

		if (!user) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		req.user = user
		next()
	} catch (error) {
		console.error(error)
		return res.status(401).json({ message: 'Invalid token' })
	}
}

export default authorizationMiddleware
