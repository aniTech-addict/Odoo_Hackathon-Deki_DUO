import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'

// Mock the sendMail module before importing any code that uses it
jest.unstable_mockModule('../utils/sendMail.js', () => {
	return {
		createMail: class {
			subject: string
			text: string
			html: string
			constructor(subject: string, text: string, html: string) {
				this.subject = subject
				this.text = text
				this.html = html
			}
		},
		sendMail: jest.fn().mockImplementation(() => Promise.resolve({ messageId: 'mocked-id' })),
	}
})

// Dynamically import everything else so that Jest's ESM mocks are correctly applied
const { sendMail } = await import('../utils/sendMail.js')
const { default: prisma } = await import('../db/prisma.js')
const { sign_in, sign_up, otp_verification } = await import('../controller/auth.controller.js')
const { default: bcrypt } = await import('bcrypt')

describe('Authentication Lockout Logic', () => {
	const username = 'jesttestuser'
	const email = 'jesttestuser@example.com'
	const correctPassword = 'correctpassword'
	const incorrectPassword = 'wrongpassword'

	beforeAll(async () => {
		// Ensure clean state before starting any test
		await prisma.user.deleteMany({ where: { OR: [{ username }, { email }] } })
	})

	afterAll(async () => {
		// Clean up database after tests complete
		await prisma.user.deleteMany({ where: { OR: [{ username }, { email }] } })
	})

	beforeEach(async () => {
		// Clear mock history
		jest.clearAllMocks()
		// Recreate test user in default active state before each test
		await prisma.user.deleteMany({ where: { OR: [{ username }, { email }] } })
		const hashedPassword = await bcrypt.hash(correctPassword, 10)
		await prisma.user.create({
			data: {
				username,
				email,
				password: hashedPassword,
				isVerified: true,
			},
		})
	})

	const mockRes = () => {
		const res: any = {}
		res.status = jest.fn().mockImplementation((code: number) => {
			res.statusCode = code
			return res
		})
		res.json = jest.fn().mockImplementation((data: any) => {
			res.jsonData = data
			return res
		})
		res.cookie = jest.fn().mockImplementation((name: string, value: string, options: any) => {
			res.cookieData = { name, value, options }
			return res
		})
		return res
	}

	it('should login successfully with correct credentials', async () => {
		const req = { body: { username, password: correctPassword } }
		const res = mockRes()

		await sign_in(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.jsonData.status).toBe('success')
		expect(res.jsonData.message).toBe('User signed in successfully')

		const user: any = await prisma.user.findUnique({ where: { username } })
		expect(user?.status).toBe('active')
		expect(user?.failedAttempts).toBe(0)
	})

	it('should track failed attempts and not lock before 5 failed attempts', async () => {
		const resList = []

		for (let i = 0; i < 4; i++) {
			const req = { body: { username, password: incorrectPassword } }
			const res = mockRes()
			await sign_in(req, res)
			resList.push(res)
		}

		resList.forEach((res) => {
			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.jsonData.message).toBe('Invalid password')
		})

		const user: any = await prisma.user.findUnique({ where: { username } })
		expect(user?.status).toBe('active')
		expect(user?.failedAttempts).toBe(4)
	})

	it('should reset failed attempts count to 0 upon a successful login', async () => {
		// 1. Trigger some failed attempts
		for (let i = 0; i < 3; i++) {
			const req = { body: { username, password: incorrectPassword } }
			const res = mockRes()
			await sign_in(req, res)
		}

		let user: any = await prisma.user.findUnique({ where: { username } })
		expect(user?.failedAttempts).toBe(3)

		// 2. Perform successful login
		const req = { body: { username, password: correctPassword } }
		const res = mockRes()
		await sign_in(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		user = await prisma.user.findUnique({ where: { username } })
		expect(user?.failedAttempts).toBe(0)
		expect(user?.status).toBe('active')
	})

	it('should lock the account on the 5th consecutive failed attempt', async () => {
		const resList = []

		for (let i = 0; i < 5; i++) {
			const req = { body: { username, password: incorrectPassword } }
			const res = mockRes()
			await sign_in(req, res)
			resList.push(res)
		}

		// The first 4 should be standard invalid password errors
		for (let i = 0; i < 4; i++) {
			expect(resList[i].status).toHaveBeenCalledWith(401)
			expect(resList[i].jsonData.message).toBe('Invalid password')
		}

		// The 5th should return that the account is locked
		expect(resList[4].status).toHaveBeenCalledWith(401)
		expect(resList[4].jsonData.message).toBe('Account is locked due to too many failed attempts')

		const user: any = await prisma.user.findUnique({ where: { username } })
		expect(user?.status).toBe('locked')
		expect(user?.failedAttempts).toBe(5)

		// Assert that the security alert email was sent
		expect(sendMail).toHaveBeenCalledWith(email, expect.objectContaining({
			subject: 'Security Alert: Your Account Has Been Locked',
		}))
	})

	it('should immediately reject sign-in attempts on a locked account with 403 status', async () => {
		// 1. Lock the account
		for (let i = 0; i < 5; i++) {
			const req = { body: { username, password: incorrectPassword } }
			const res = mockRes()
			await sign_in(req, res)
		}

		// Verify it is locked in the database
		let user: any = await prisma.user.findUnique({ where: { username } })
		expect(user?.status).toBe('locked')

		// 2. Attempt login with the correct password
		const req = { body: { username, password: correctPassword } }
		const res = mockRes()
		await sign_in(req, res)

		expect(res.status).toHaveBeenCalledWith(403)
		expect(res.jsonData.message).toBe('Account is locked due to too many failed attempts')
	})

	describe('Signup Role Restrictions', () => {
		const newUsername = 'newsignupuser'
		const newEmail = 'newsignupuser@example.com'
		const newPassword = 'password123'

		beforeEach(async () => {
			await prisma.user.deleteMany({ where: { OR: [{ username: newUsername }, { email: newEmail }] } })
		})

		it('should fail registration when an invalid role is provided', async () => {
			const req = {
				body: {
					username: newUsername,
					email: newEmail,
					password: newPassword,
					role: 'InvalidRole',
				},
			}
			const res = mockRes()

			await sign_up(req, res)

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.jsonData.message).toBe('Invalid sign up data')
			expect(res.jsonData.errors).toBeDefined()
		})

		it('should pass registration for all 4 defined roles', async () => {
			const roles = ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']

			for (const role of roles) {
				await prisma.user.deleteMany({ where: { OR: [{ username: newUsername }, { email: newEmail }] } })

				const req = {
					body: {
						username: newUsername,
						email: newEmail,
						password: newPassword,
						role,
					},
				}
				const res = mockRes()

				await sign_up(req, res)

				expect(res.status).toHaveBeenCalledWith(201)
				expect(res.jsonData.status).toBe('success')
				expect(res.jsonData.message).toBe('redirect to otp verification')
				expect(res.jsonData.userSignupToken).toBeDefined()
			}
		})
	})
})
