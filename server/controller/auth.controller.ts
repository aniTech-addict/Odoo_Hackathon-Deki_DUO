import prisma from '../db/prisma.js'
import { createAccessToken, createRefreshToken } from '../utils/createToken.js'
import bcrypt from 'bcrypt'
import { generateOtp, verifyOtpValue } from '../utils/otpManager.js'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { JWT_ACCESS_SECRET } from '../configs/env.js'
import { createMail, sendMail } from '../utils/sendMail.js'
import {
	authCredentialsSchema,
	signUpSchema,
	type SignUpInput,
	type SignInInput,
} from '../schemas/auth.schema.js'

const otpVerificationSchema = z.object({
	otp: z.coerce.number(),
	userSignupToken: z.string().min(1, 'User signup token is required'),
})

type OtpVerificationInput = z.infer<typeof otpVerificationSchema>



export const sign_up = async (req, res) => {
	try {
		const parsedBody = signUpSchema.safeParse(req.body)

		if (!parsedBody.success) {
			return res.status(400).json({
				message: 'Invalid sign up data',
				errors: z.treeifyError(parsedBody.error)
			})
		}

		const { username, email, password, role }: SignUpInput = parsedBody.data

		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ username }, { email }],
			},
		})

		if (existingUser) {
			if (existingUser.isVerified) {
				return res.status(400).json({ message: 'User already exists' })
			}
			await prisma.user.delete({ where: { id: existingUser.id } })
		}

		const hashedOtp = await generateOtp(email)
		const hashedPassword = await bcrypt.hash(password, 10)

		const signupToken = jwt.sign(
			{ username, email, password: hashedPassword, role, hashedOtp },
			JWT_ACCESS_SECRET,
			{ expiresIn: '5m' }
		)

		return res.status(201).json({
			status: 'success',
			message: 'redirect to otp verification',
			userSignupToken: signupToken,
		})
	} catch (error) {
		console.log('Error in sign up:', error)
		res.status(500).json({ message: 'Internal server error at sign up' })
	}
}

export const otp_verification = async (req, res) => {
	const parsedBody = otpVerificationSchema.safeParse(req.body)

	if (!parsedBody.success) {
		return res.status(400).json({
			status: 'failed',
			message: 'Invalid OTP verification data',
			errors: z.treeifyError(parsedBody.error)
		})
	}

	const { otp, userSignupToken }: OtpVerificationInput = parsedBody.data

	try {
		let decoded: any
		try {
			decoded = jwt.verify(userSignupToken, JWT_ACCESS_SECRET)
		} catch (err) {
			return res.status(400).json({ status: 'failed', message: 'Invalid or expired signup token' })
		}

		const { username, email, password, role, hashedOtp } = decoded

		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ username }, { email }],
			},
		})

		if (existingUser) {
			if (existingUser.isVerified) {
				return res.status(400).json({ message: 'User already exists' })
			}
			await prisma.user.delete({ where: { id: existingUser.id } })
		}

		const validOtp = await verifyOtpValue(otp, hashedOtp)

		if (!validOtp) {
			return res.status(401).json({ success: false, message: 'Invalid OTP' })
		}

		const newUser = await prisma.user.create({
			data: {
				username,
				email,
				password, // already hashed
				role,
				isVerified: true,
			},
		})

		const payload = { userId: newUser.id, username: newUser.username }
		const accessToken = await createAccessToken(payload)
		const refreshToken = await createRefreshToken(payload)

		res.cookie('token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict' })

		await prisma.user.update({
			where: { id: newUser.id },
			data: { refreshToken },
		})

		return res.status(200).json({ status: 'success', message: 'OTP verified successfully', userId: newUser.id })
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

		const user: any = await prisma.user.findUnique({ where: { username } })
		if (!user) {
			return res.status(404).json({ status: 'failed', message: 'User not found' })
		}

		if (user.status === 'locked') {
			return res.status(403).json({
				status: 'failed',
				message: 'Account is locked due to too many failed attempts',
			})
		}

		const isPasswordValid = await bcrypt.compare(password, user.password)
		if (!isPasswordValid) {
			const newAttempts = user.failedAttempts + 1
			if (newAttempts >= 5) {
				await (prisma.user.update as any)({
					where: { id: user.id },
					data: {
						failedAttempts: newAttempts,
						status: 'locked',
					},
				})
				const mailContent = new createMail(
					'Security Alert: Your Account Has Been Locked',
					`Hello,\n\nThere were multiple failed login attempts on your account. For your security, your account has been temporarily locked.\n\nIf this wasn't you, please contact support immediately.\n\nBest regards,\nThe AniTech Team`,
					`
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
							<h2 style="color: #dc2626; text-align: center;">Security Alert: Account Locked</h2>
							<p>Hello,</p>
							<p>We detected multiple failed login attempts for your account. To protect your personal information, your account has been temporarily locked.</p>
							<p style="color: #dc2626; font-weight: bold;">If you did not initiate these login attempts, your account credentials may be compromised.</p>
							<p>Please contact our support team immediately to verify your identity and unlock your account.</p>
							<br />
							<p>Best regards,<br /><strong>The AniTech Team</strong></p>
						</div>
					`
				)
				sendMail(user.email, mailContent).catch((err) => {
					console.error('Failed to send account lockout email:', err)
				})
				return res.status(401).json({
					status: 'failed',
					message: 'Account is locked due to too many failed attempts',
				})
			} else {
				await (prisma.user.update as any)({
					where: { id: user.id },
					data: {
						failedAttempts: newAttempts,
					},
				})
				return res.status(401).json({
					status: 'failed',
					message: 'Invalid password',
				})
			}
		}

		const token = await createAccessToken({ userId: user.id, username: user.username })
		const refreshToken = await createRefreshToken({ userId: user.id, username: user.username })

		const updateData: any = { refreshToken }
		if (user.failedAttempts > 0) {
			updateData.failedAttempts = 0
		}

		await (prisma.user.update as any)({
			where: { id: user.id },
			data: updateData,
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
