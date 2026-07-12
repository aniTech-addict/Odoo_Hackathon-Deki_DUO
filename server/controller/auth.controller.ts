import prisma from '../db/prisma.js'
import { createAccessToken, createRefreshToken } from '../utils/createToken.js'
import bcrypt from 'bcrypt'
import { generateOtp } from '../utils/otpManager.js'
import { verifyOtp } from '../utils/otpManager.js'
import { z } from 'zod'

const authCredentialsSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
})

const signUpSchema = authCredentialsSchema.extend({
	email: z.email('Invalid email format'),
})

type SignUpInput = z.infer<typeof signUpSchema>
type SignInInput = z.infer<typeof authCredentialsSchema>

export const sign_up = async (req, res) => {
	try {
		const parsedBody = signUpSchema.safeParse(req.body)

		if (!parsedBody.success) {
			return res.status(400).json({
				message: 'Invalid sign up data',
				errors: parsedBody.error.flatten().fieldErrors,
			})
		}

		const { username, email, password }: SignUpInput = parsedBody.data

		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ username }, { email }],
			},
		})

		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' })
		}

		const otpId = await generateOtp(email)
		const newUser = await prisma.user.create({
			data: {
				username,
				email,
				password: await bcrypt.hash(password, 10),
				otpId,
			},
		})

		return res.status(201).json({
			status: 'success',
			message: 'redirect to otp verification',
			userId: newUser.id,
		})
	} catch (error) {
		console.log('Error in sign up:', error)
		res.status(500).json({ message: 'Internal server error at sign up' })
	}
}

export const otp_verification = async (req, res) => {
	const { otp, userId } = req.body

	const validOtp = await verifyOtp(userId, otp)

	if (!validOtp) {
		return res.status(401).json({ success: false, message: 'Invalid OTP' })
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		const payload = { userId: user.id, username: user.username }
		const accessToken = await createAccessToken(payload)
		const refreshToken = await createRefreshToken(payload)

		res.cookie('token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict' })

		await prisma.$transaction([
			prisma.user.update({
				where: { id: userId },
				data: {
					isVerified: true,
					refreshToken,
					otpId: null,
				},
			}),
		])

		return res.status(200).json({ status: 'success', message: 'OTP verified successfully' })
	} catch (err) {
		console.log(err)
		res.status(500).json({ message: 'Internal server error' })
	}
}

export const sign_in = async (req, res) => {
	try {
		const parsedBody = authCredentialsSchema.safeParse(req.body)

		if (!parsedBody.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid sign in data',
				errors: z.treeifyError(parsedBody.error),
			})
		}

		const { username, password }: SignInInput = parsedBody.data

		const user = await prisma.user.findUnique({ where: { username } })
		if (!user) {
			return res.status(404).json({ status: 'failed', message: 'User not found' })
		}

		const isPasswordValid = await bcrypt.compare(password, user.password)
		if (!isPasswordValid) {
			return res.status(401).json({ status: 'failed', message: 'Invalid password ' })
		}

		const token = await createAccessToken({ userId: user.id, username: user.username })
		const refreshToken = await createRefreshToken({ userId: user.id, username: user.username })

		await prisma.user.update({
			where: { id: user.id },
			data: { refreshToken },
		})
		//Sets cookies
		res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' })
		res.status(200).json({
			status: 'success',
			message: 'User signed in successfully',
			userId: user.id,
		})
	} catch (err) {
		console.log('Sign-in error:', err.message)
		res.status(400).json({ status: 'failed', message: err.message })
	}
}
export const sign_out = () => {}
