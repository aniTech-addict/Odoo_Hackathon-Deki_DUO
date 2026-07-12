import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import prisma from '../db/prisma.js'
import {
	registerTrip,
	updateTrip,
	deleteTrip,
	getTrips,
} from '../controller/trip.controller.js'

type MockResponse = {
	statusCode?: number
	jsonData?: any
	status: (code: number) => MockResponse
	json: (data: any) => MockResponse
}

describe('Trip Management & Transitions Integration Logic', () => {
	const testPlates = ['TRIP-VEH1']
	const testDrivers = ['Trip Driver A']
	const testRoutes = ['Test Route A']

	beforeAll(async () => {
		await prisma.trip.deleteMany({ where: { route: { in: testRoutes } } })
		await prisma.vehicle.deleteMany({ where: { registrationNumber: { in: testPlates } } })
		await prisma.driver.deleteMany({ where: { name: { in: testDrivers } } })
	})

	afterAll(async () => {
		await prisma.trip.deleteMany({ where: { route: { in: testRoutes } } })
		await prisma.vehicle.deleteMany({ where: { registrationNumber: { in: testPlates } } })
		await prisma.driver.deleteMany({ where: { name: { in: testDrivers } } })
	})

	beforeEach(async () => {
		await prisma.trip.deleteMany({ where: { route: { in: testRoutes } } })
		await prisma.vehicle.deleteMany({ where: { registrationNumber: { in: testPlates } } })
		await prisma.driver.deleteMany({ where: { name: { in: testDrivers } } })

		// Create vehicle and driver for testing
		await prisma.vehicle.create({
			data: {
				registrationNumber: 'TRIP-VEH1',
				model: 'van-05',
				type: ['Van'],
				capacityAmount: 500,
				capacityUnit: 'kg',
				odometer: 1000,
				costAmount: 15000,
				status: 'available',
			},
		})

		await prisma.driver.create({
			data: {
				name: 'Trip Driver A',
				licenseNumber: 'DL-12345',
				licenseCategory: 'Heavy',
				licenseExpiry: '2030-12-31',
				contactNumber: '12345',
				status: 'Available',
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

	it('should register a trip successfully and update assets on dispatch', async () => {
		const req = {
			body: {
				route: 'Test Route A',
				origin: 'Warehouse A',
				destination: 'Warehouse B',
				vehiclePlate: 'TRIP-VEH1',
				driver: 'Trip Driver A',
				departure: '08:00',
				cargoWeight: 200,
				plannedDistance: 150,
				status: 'Dispatched',
			},
		} as const
		const res = mockRes()

		await registerTrip(req, res)

		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.jsonData.status).toBe('success')

		// Vehicle should transition to "on trip"
		const vehicle = await prisma.vehicle.findUnique({ where: { registrationNumber: 'TRIP-VEH1' } })
		expect(vehicle?.status).toBe('on trip')

		// Driver should transition to "On Trip"
		const driver = await prisma.driver.findUnique({ where: { name: 'Trip Driver A' } })
		expect(driver?.status).toBe('On Trip')
	})

	it('should update trip status to Complete and update vehicle odometer mileage', async () => {
		// 1. Create a dispatched trip
		const trip = await prisma.trip.create({
			data: {
				route: 'Test Route A',
				origin: 'Warehouse A',
				destination: 'Warehouse B',
				vehiclePlate: 'TRIP-VEH1',
				driver: 'Trip Driver A',
				departure: '08:00',
				cargoWeight: 200,
				plannedDistance: 150,
				status: 'Dispatched',
			},
		})

		// Mark vehicle and driver as on trip
		await prisma.vehicle.update({
			where: { registrationNumber: 'TRIP-VEH1' },
			data: { status: 'on trip' },
		})
		await prisma.driver.update({
			where: { name: 'Trip Driver A' },
			data: { status: 'On Trip' },
		})

		const req = {
			params: { id: trip.id },
			body: {
				status: 'Completed',
			},
		} as const
		const res = mockRes()

		await updateTrip(req, res)

		expect(res.status).toHaveBeenCalledWith(200)

		// Vehicle should transition to available and odometer should increase by 150 (1000 + 150 = 1150)
		const vehicle = await prisma.vehicle.findUnique({ where: { registrationNumber: 'TRIP-VEH1' } })
		expect(vehicle?.status).toBe('available')
		expect(vehicle?.odometer).toBe(1150)

		// Driver should transition to Available
		const driver = await prisma.driver.findUnique({ where: { name: 'Trip Driver A' } })
		expect(driver?.status).toBe('Available')
	})
})
