import prisma from '../db/prisma.js'
import { CreateDriverInput, UpdateDriverInput } from '../schemas/driver.schema.js'

export class DriverService {
	static async createDriver(data: CreateDriverInput) {
		const existing = await prisma.driver.findUnique({
			where: { name: data.name },
		})
		if (existing) {
			throw new Error('A driver with this name already exists')
		}

		return await prisma.driver.create({
			data: {
				name: data.name,
				licenseNumber: data.licenseNumber,
				licenseCategory: data.licenseCategory,
				licenseExpiry: data.licenseExpiry,
				contactNumber: data.contactNumber,
				safetyScore: data.safetyScore,
				status: data.status,
			},
		})
	}

	static async updateDriver(id: string, data: UpdateDriverInput) {
		const driver = await prisma.driver.findUnique({ where: { id } })
		if (!driver) {
			throw new Error('Driver not found')
		}

		if (data.name && data.name !== driver.name) {
			const existing = await prisma.driver.findUnique({
				where: { name: data.name },
			})
			if (existing) {
				throw new Error('A driver with this name already exists')
			}
		}

		return await prisma.driver.update({
			where: { id },
			data,
		})
	}

	static async deleteDriver(id: string) {
		const driver = await prisma.driver.findUnique({ where: { id } })
		if (!driver) {
			throw new Error('Driver not found')
		}
		return await prisma.driver.delete({ where: { id } })
	}

	static async getDriverById(id: string) {
		return await prisma.driver.findUnique({ where: { id } })
	}

	static async listDrivers(filters: { status?: string }) {
		const where: { status?: string } = {}
		if (filters.status) {
			where.status = filters.status
		}
		return await prisma.driver.findMany({
			where,
			orderBy: { createdAt: 'desc' },
		})
	}
}
