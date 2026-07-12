import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import prisma from '../db/prisma.js'
import {
	createMaintenanceLog,
	updateMaintenanceLog,
	deleteMaintenanceLog,
	getMaintenanceLogs,
} from '../controller/maintenance.controller.js'

type MockResponse = {
	statusCode?: number
	jsonData?: any
	status: (code: number) => MockResponse
	json: (data: any) => MockResponse
}

describe('Maintenance Log Integration Logic', () => {
	const testAssets = ['MAINT-VEH1']

	beforeAll(async () => {
		await prisma.maintenanceLog.deleteMany({ where: { asset: { in: testAssets } } })
		await prisma.vehicle.deleteMany({ where: { registrationNumber: { in: testAssets } } })
	})

	afterAll(async () => {
		await prisma.maintenanceLog.deleteMany({ where: { asset: { in: testAssets } } })
		await prisma.vehicle.deleteMany({ where: { registrationNumber: { in: testAssets } } })
	})

	beforeEach(async () => {
		await prisma.maintenanceLog.deleteMany({ where: { asset: { in: testAssets } } })
		await prisma.vehicle.deleteMany({ where: { registrationNumber: { in: testAssets } } })

		// Create vehicle for testing
		await prisma.vehicle.create({
			data: {
				registrationNumber: 'MAINT-VEH1',
				model: 'van-05',
				type: ['Van'],
				capacityAmount: 500,
				capacityUnit: 'kg',
				odometer: 1000,
				costAmount: 15000,
				status: 'available',
			},
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

	it('should create a maintenance log and set vehicle to in shop on Service start', async () => {
		const req = {
			body: {
				title: 'Oil Change',
				asset: 'MAINT-VEH1',
				status: 'In Service',
				cost: 80,
				nextCheck: '2026-08-12',
			},
		} as const
		const res = mockRes()

		await createMaintenanceLog(req, res)

		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.jsonData.status).toBe('success')

		// Vehicle should transition to "in shop"
		const vehicle = await prisma.vehicle.findUnique({ where: { registrationNumber: 'MAINT-VEH1' } })
		expect(vehicle?.status).toBe('in shop')
	})

	it('should transition vehicle back to available when maintenance status updates to Complete', async () => {
		const log = await prisma.maintenanceLog.create({
			data: {
				title: 'Brake Check',
				asset: 'MAINT-VEH1',
				status: 'In Service',
				cost: 120,
				nextCheck: '2026-09-12',
			},
		})

		await prisma.vehicle.update({
			where: { registrationNumber: 'MAINT-VEH1' },
			data: { status: 'in shop' },
		})

		const req = {
			params: { id: log.id },
			body: {
				status: 'Complete',
			},
		} as const
		const res = mockRes()

		await updateMaintenanceLog(req, res)

		expect(res.status).toHaveBeenCalledWith(200)

		// Vehicle should transition back to "available"
		const vehicle = await prisma.vehicle.findUnique({ where: { registrationNumber: 'MAINT-VEH1' } })
		expect(vehicle?.status).toBe('available')
	})
})
