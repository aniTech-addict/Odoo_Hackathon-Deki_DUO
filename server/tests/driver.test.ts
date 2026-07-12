import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import prisma from '../db/prisma.js'
import {
	registerDriver,
	updateDriver,
	deleteDriver,
	getDrivers,
} from '../controller/driver.controller.js'

type MockResponse = {
	statusCode?: number
	jsonData?: any
	status: (code: number) => MockResponse
	json: (data: any) => MockResponse
}

describe('Driver Registry Integration Logic', () => {
	const testDrivers = ['Test Driver A', 'Test Driver B']

	beforeAll(async () => {
		await prisma.driver.deleteMany({
			where: { name: { in: testDrivers } },
		})
	})

	afterAll(async () => {
		await prisma.driver.deleteMany({
			where: { name: { in: testDrivers } },
		})
	})

	beforeEach(async () => {
		await prisma.driver.deleteMany({
			where: { name: { in: testDrivers } },
		})
	})

	const mockRes = () => {
		const res = {} as MockResponse
		res.status = jest.fn().mockImplementation((code: number) => {
			res.statusCode = code
			return res
		})
		res.json = jest.fn().mockImplementation((data: any) => {
			res.jsonData = data
			return res
		})
		return res
	}

	it('should fail registration on invalid data format', async () => {
		const req = {
			body: {
				name: 'Te', // Too short
				licenseNumber: '123',
				licenseCategory: '',
				licenseExpiry: 'invalid-date',
				contactNumber: '123',
			},
		} as const
		const res = mockRes()

		await registerDriver(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.jsonData.status).toBe('failed')
		expect(res.jsonData.message).toBe('Invalid driver data')
	})

	it('should register a driver successfully', async () => {
		const req = {
			body: {
				name: 'Test Driver A',
				licenseNumber: 'DL-12345',
				licenseCategory: 'Heavy Vehicle',
				licenseExpiry: '2030-12-31',
				contactNumber: '+1234567890',
				safetyScore: 98,
				status: 'Available',
			},
		} as const
		const res = mockRes()

		await registerDriver(req, res)

		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.jsonData.status).toBe('success')
		expect(res.jsonData.data.name).toBe('Test Driver A')

		const dbDriver = await prisma.driver.findUnique({ where: { name: 'Test Driver A' } })
		expect(dbDriver).toBeDefined()
		expect(dbDriver?.licenseNumber).toBe('DL-12345')
	})

	it('should update driver details successfully', async () => {
		const created = await prisma.driver.create({
			data: {
				name: 'Test Driver A',
				licenseNumber: 'DL-12345',
				licenseCategory: 'Heavy',
				licenseExpiry: '2030-12-31',
				contactNumber: '12345',
				status: 'Available',
			},
		})

		const req = {
			params: { id: created.id },
			body: {
				status: 'Suspended',
				safetyScore: 85,
			},
		} as const
		const res = mockRes()

		await updateDriver(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.jsonData.data.status).toBe('Suspended')
		expect(res.jsonData.data.safetyScore).toBe(85)
	})

	it('should delete a driver successfully', async () => {
		const created = await prisma.driver.create({
			data: {
				name: 'Test Driver A',
				licenseNumber: 'DL-12345',
				licenseCategory: 'Heavy',
				licenseExpiry: '2030-12-31',
				contactNumber: '12345',
			},
		})

		const req = { params: { id: created.id } } as any
		const res = mockRes()

		await deleteDriver(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.jsonData.message).toBe('Driver deleted successfully')

		const dbDriver = await prisma.driver.findUnique({ where: { id: created.id } })
		expect(dbDriver).toBeNull()
	})
})
