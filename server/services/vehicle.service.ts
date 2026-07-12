import { Prisma } from '@prisma/client'
import prisma from '../db/prisma.js'
import { CreateVehicleInput, UpdateVehicleInput } from '../schemas/vehicle.schema.js'

export interface VehicleFilters {
	status?: string
	type?: string | string[]
	model?: string
	minOdometer?: number
	maxOdometer?: number
	minCapacity?: number
	maxCapacity?: number
	capacityUnit?: string
	minCost?: number
	maxCost?: number
	costCurrency?: string
}

export class VehicleService {
	static async createVehicle(data: CreateVehicleInput) {
		const existing = await prisma.vehicle.findUnique({
			where: { registrationNumber: data.registrationNumber },
		})
		if (existing) {
			throw new Error('A vehicle with this registration number already exists')
		}

		return await prisma.vehicle.create({
			data: {
				registrationNumber: data.registrationNumber,
				model: data.model,
				type: data.type,
				capacityAmount: data.capacity.amount,
				capacityUnit: data.capacity.unit,
				odometer: data.odometer,
				costAmount: data.acquirementCost.amount,
				costCurrency: data.acquirementCost.currency,
				status: data.status,
			},
		})
	}

	static async updateVehicle(id: string, data: UpdateVehicleInput) {
		const vehicle = await prisma.vehicle.findUnique({ where: { id } })
		if (!vehicle) {
			throw new Error('Vehicle not found')
		}

		if (data.registrationNumber && data.registrationNumber !== vehicle.registrationNumber) {
			const existing = await prisma.vehicle.findUnique({
				where: { registrationNumber: data.registrationNumber },
			})
			if (existing) {
				throw new Error('A vehicle with this registration number already exists')
			}
		}

		const updateData: Prisma.VehicleUpdateInput = {}
		if (data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNumber
		if (data.model !== undefined) updateData.model = data.model
		if (data.type !== undefined) updateData.type = data.type
		if (data.odometer !== undefined) updateData.odometer = data.odometer
		if (data.status !== undefined) updateData.status = data.status

		if (data.capacity) {
			if (data.capacity.amount !== undefined) updateData.capacityAmount = data.capacity.amount
			if (data.capacity.unit !== undefined) updateData.capacityUnit = data.capacity.unit
		}

		if (data.acquirementCost) {
			if (data.acquirementCost.amount !== undefined) updateData.costAmount = data.acquirementCost.amount
			if (data.acquirementCost.currency !== undefined) updateData.costCurrency = data.acquirementCost.currency
		}

		return await prisma.vehicle.update({
			where: { id },
			data: updateData,
		})
	}

	static async deleteVehicle(id: string) {
		const vehicle = await prisma.vehicle.findUnique({ where: { id } })
		if (!vehicle) {
			throw new Error('Vehicle not found')
		}
		return await prisma.vehicle.delete({ where: { id } })
	}

	static async getVehicleById(id: string) {
		return await prisma.vehicle.findUnique({ where: { id } })
	}

	static async listVehicles(filters: VehicleFilters) {
		const where: Prisma.VehicleWhereInput = {}

		if (filters.status) {
			where.status = filters.status
		}

		if (filters.type) {
			const types = Array.isArray(filters.type)
				? filters.type
				: typeof filters.type === 'string'
				? filters.type.split(',').map((t) => t.trim())
				: []
			if (types.length > 0) {
				where.type = { hasSome: types }
			}
		}

		if (filters.model) {
			where.model = { contains: filters.model, mode: 'insensitive' }
		}

		if (filters.minOdometer !== undefined || filters.maxOdometer !== undefined) {
			where.odometer = {}
			if (filters.minOdometer !== undefined) where.odometer.gte = Number(filters.minOdometer)
			if (filters.maxOdometer !== undefined) where.odometer.lte = Number(filters.maxOdometer)
		}

		if (filters.minCapacity !== undefined || filters.maxCapacity !== undefined) {
			where.capacityAmount = {}
			if (filters.minCapacity !== undefined) where.capacityAmount.gte = Number(filters.minCapacity)
			if (filters.maxCapacity !== undefined) where.capacityAmount.lte = Number(filters.maxCapacity)
		}

		if (filters.capacityUnit) {
			where.capacityUnit = filters.capacityUnit
		}

		if (filters.minCost !== undefined || filters.maxCost !== undefined) {
			where.costAmount = {}
			if (filters.minCost !== undefined) where.costAmount.gte = Number(filters.minCost)
			if (filters.maxCost !== undefined) where.costAmount.lte = Number(filters.maxCost)
		}

		if (filters.costCurrency) {
			where.costCurrency = filters.costCurrency
		}

		return await prisma.vehicle.findMany({
			where,
			orderBy: { createdAt: 'desc' },
		})
	}
}
