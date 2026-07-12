import { z } from 'zod'

export const userSchema = z.object({
	id: z.cuid2(),
	username: z.string().min(1, 'Username is required'),
	email: z.email('Invalid email format'),
	avatar: z.string().nullable().optional(),
	password: z.string().min(1, 'Password is required'),
	refreshToken: z.string().nullable().optional(),
	type: z.string().default('user'),
	role: z.string().default('user'),
	isVerified: z.boolean().default(false),
	otpId: z.string().cuid().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export type User = z.infer<typeof userSchema>

export const createUserSchema = userSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const otpSchema = z.object({
	id: z.cuid2(),
	otp: z.string().min(1, 'OTP is required'),
	expireAt: z.date(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export type Otp = z.infer<typeof otpSchema>

export const createOtpSchema = otpSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
})

export type CreateOtpInput = z.infer<typeof createOtpSchema>
