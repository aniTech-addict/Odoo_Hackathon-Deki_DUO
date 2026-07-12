import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import prisma from '../db/prisma.js'
import {
	registerVehicle,
	updateVehicle,
	deleteVehicle,
	getVehicles,
} from '../controller/vehicle.controller.js'

type MockResponse = {
	statusCode?: number
	jsonData?: unknown
	status: (code: number) => MockResponse
	json: (data: unknown) => MockResponse
}

describe('Vehicle Registry & Filtration Logic', () => {
	const testRegs = ['TEST-001', 'TEST-002', 'TEST-003']

	beforeAll(async () => {
		await prisma.vehicle.deleteMany({
			where: { registrationNumber: { in: testRegs } },
		})
	})

	afterAll(async () => {
		await prisma.vehicle.deleteMany({
			where: { registrationNumber: { in: testRegs } },
		})
	})

	beforeEach(async () => {
		await prisma.vehicle.deleteMany({
			where: { registrationNumber: { in: testRegs } },
		})
	})

	const mockRes = () => {
		const res = {} as MockResponse
		res.status = jest.fn().mockImplementation((code: number) => {
			res.statusCode = code
			return res
		})
		res.json = jest.fn().mockImplementation((data: unknown) => {
			res.jsonData = data
			return res
		})
		return res
	}

	it('should fail registration on invalid data format', async () => {
		const req = {
			body: {
				registrationNumber: 'TEST-001',
				model: 'van-05',
				type: [], // Empty array should fail
				capacity: { amount: -5, unit: 'invalid-unit' }, // Invalid unit and negative amount
				odometer: -100, // Negative odometer should fail
				acquirementCost: { amount: 15000, currency: 'rupees' },
				status: 'available',
			},
		} as const
		const res = mockRes()

		await registerVehicle(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.jsonData.status).toBe('failed')
		expect(res.jsonData.message).toBe('Invalid vehicle data')
		expect(res.jsonData.errors).toBeDefined()
	})

	it('should register a vehicle successfully', async () => {
		const req = {
			body: {
				registrationNumber: 'TEST-001',
				model: 'van-05',
				type: ['Van'],
				capacity: { amount: 500, unit: 'kg' },
				odometer: 1000,
				acquirementCost: { amount: 15000, currency: 'rupees' },
				status: 'available',
			},
		} as const
		const res = mockRes()

		await registerVehicle(req, res)

		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.jsonData.status).toBe('success')
		expect(res.jsonData.data.registrationNumber).toBe('TEST-001')

		const dbVehicle = await prisma.vehicle.findUnique({ where: { registrationNumber: 'TEST-001' } })
		expect(dbVehicle).toBeDefined()
		expect(dbVehicle?.capacityAmount).toBe(500)
		expect(dbVehicle?.capacityUnit).toBe('kg')
	})

	it('should update a vehicle successfully', async () => {
		// 1. Create a vehicle
		const created = await prisma.vehicle.create({
			data: {
				registrationNumber: 'TEST-001',
				model: 'van-05',
				type: ['Van'],
				capacityAmount: 500,
				capacityUnit: 'kg',
				odometer: 1000,
				costAmount: 15000,
				costCurrency: 'rupees',
				status: 'available',
			},
		})

		// 2. Update status and odometer
		const req = {
			params: { id: created.id },
			body: {
				status: 'on trip',
				odometer: 1500,
			},
		} as const
		const res = mockRes()

		await updateVehicle(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.jsonData.data.status).toBe('on trip')
		expect(res.jsonData.data.odometer).toBe(1500)
	})

	it('should delete a vehicle successfully', async () => {
		const created = await prisma.vehicle.create({
			data: {
				registrationNumber: 'TEST-001',
				model: 'van-05',
				type: ['Van'],
				capacityAmount: 500,
				capacityUnit: 'kg',
				odometer: 1000,
				costAmount: 15000,
				costCurrency: 'rupees',
				status: 'available',
			},
		})

		const req = { params: { id: created.id } } as any
		const res = mockRes()

		await deleteVehicle(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.jsonData.message).toBe('Vehicle deleted successfully')

		const dbVehicle = await prisma.vehicle.findUnique({ where: { id: created.id } })
		expect(dbVehicle).toBeNull()
	})

	describe('Filtration and Range Queries', () => {
		beforeEach(async () => {
			// Populate with 3 distinct test vehicles
			await prisma.vehicle.createMany({
				data: [
					{
						registrationNumber: 'TEST-001',
						model: 'van-05',
						type: ['Van'],
						capacityAmount: 500,
						capacityUnit: 'kg',
						odometer: 1000,
						costAmount: 15000,
						costCurrency: 'rupees',
						status: 'available',
					},
					{
						registrationNumber: 'TEST-002',
						model: 'truck-11',
						type: ['Truck', 'Heavy'],
						capacityAmount: 5,
						capacityUnit: 'ton',
						odometer: 5000,
						costAmount: 45000,
						costCurrency: 'dollars',
						status: 'on trip',
					},
					{
						registrationNumber: 'TEST-003',
						model: 'van-06',
						type: ['Van'],
						capacityAmount: 800,
						capacityUnit: 'kg',
						odometer: 12000,
						costAmount: 18000,
						costCurrency: 'rupees',
						status: 'in shop',
					},
				],
			})
		})

		it('should filter by status', async () => {
			const req = { query: { status: 'available' } } as const
			const res = mockRes()

			await getVehicles(req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.jsonData.count).toBe(1)
			expect(res.jsonData.data[0].registrationNumber).toBe('TEST-001')
		})

		it('should filter by type list contains match', async () => {
			const req = { query: { type: 'Van' } } as const
			const res = mockRes()

			await getVehicles(req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.jsonData.count).toBe(2)
			const regs = res.jsonData.data.map((v: any) => v.registrationNumber)
			expect(regs).toContain('TEST-001')
			expect(regs).toContain('TEST-003')
		})

		it('should filter by partial model name matches', async () => {
			const req = { query: { model: 'van' } } as const
			const res = mockRes()

			await getVehicles(req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.jsonData.count).toBe(2)
			const regs = res.jsonData.data.map((v: any) => v.registrationNumber)
			expect(regs).toContain('TEST-001')
			expect(regs).toContain('TEST-003')
		})

		it('should filter by odometer range', async () => {
			// Query for odometer between 2000 and 15000
			const req = { query: { minOdometer: '2000', maxOdometer: '15000' } } as const
			const res = mockRes()

			await getVehicles(req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.jsonData.count).toBe(2)
			const regs = res.jsonData.data.map((v: any) => v.registrationNumber)
			expect(regs).toContain('TEST-002')
			expect(regs).toContain('TEST-003')
		})

		it('should filter by capacity range and unit', async () => {
			// Query for capacity between 600 and 1000 kg
			const req = { query: { minCapacity: '600', maxCapacity: '1000', capacityUnit: 'kg' } } as const
			const res = mockRes()

			await getVehicles(req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.jsonData.count).toBe(1)
			expect(res.jsonData.data[0].registrationNumber).toBe('TEST-003')
		})

		it('should filter by cost range and currency', async () => {
			// Query for cost between 10000 and 20000 rupees
			const req = { query: { minCost: '10000', maxCost: '20000', costCurrency: 'rupees' } } as const
			const res = mockRes()

			await getVehicles(req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.jsonData.count).toBe(2)
			const regs = res.jsonData.data.map((v: any) => v.registrationNumber)
			expect(regs).toContain('TEST-001')
			expect(regs).toContain('TEST-003')
		})
	})
})
