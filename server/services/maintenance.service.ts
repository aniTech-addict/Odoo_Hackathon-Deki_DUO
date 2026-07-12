import prisma from '../db/prisma.js'
import { CreateMaintenanceInput, UpdateMaintenanceInput } from '../schemas/maintenance.schema.js'

export class MaintenanceService {
	static async createMaintenanceLog(data: CreateMaintenanceInput) {
		return await prisma.$transaction(async (tx) => {
			const log = await tx.maintenanceLog.create({
				data: {
					title: data.title,
					asset: data.asset,
					status: data.status,
					cost: data.cost,
					nextCheck: data.nextCheck,
				},
			})

			// Handle vehicle status transition on service creation
			if (data.status === 'In Service') {
				await tx.vehicle.updateMany({
					where: { registrationNumber: data.asset },
					data: { status: 'in shop' },
				})
			} else if (data.status === 'Complete') {
				await tx.vehicle.updateMany({
					where: { registrationNumber: data.asset },
					data: { status: 'available' },
				})
			}

			return log
		})
	}

	static async updateMaintenanceLog(id: string, data: UpdateMaintenanceInput) {
		return await prisma.$transaction(async (tx) => {
			const existingLog = await tx.maintenanceLog.findUnique({ where: { id } })
			if (!existingLog) {
				throw new Error('Maintenance log not found')
			}

			const updatedLog = await tx.maintenanceLog.update({
				where: { id },
				data,
			})

			// Check if status changed
			if (data.status && data.status !== existingLog.status) {
				const newStatus = data.status

				if (newStatus === 'In Service') {
					await tx.vehicle.updateMany({
						where: { registrationNumber: updatedLog.asset },
						data: { status: 'in shop' },
					})
				} else if (newStatus === 'Complete' || newStatus === 'Scheduled') {
					await tx.vehicle.updateMany({
						where: { registrationNumber: updatedLog.asset },
						data: { status: 'available' },
					})
				}
			}

			return updatedLog
		})
	}

	static async deleteMaintenanceLog(id: string) {
		return await prisma.$transaction(async (tx) => {
			const log = await tx.maintenanceLog.findUnique({ where: { id } })
			if (!log) {
				throw new Error('Maintenance log not found')
			}

			if (log.status === 'In Service') {
				await tx.vehicle.updateMany({
					where: { registrationNumber: log.asset },
					data: { status: 'available' },
				})
			}

			return await tx.maintenanceLog.delete({ where: { id } })
		})
	}

	static async getMaintenanceLogById(id: string) {
		return await prisma.maintenanceLog.findUnique({ where: { id } })
	}

	static async listMaintenanceLogs(filters: { status?: string; asset?: string }) {
		const where: any = {}
		if (filters.status) {
			where.status = filters.status
		}
		if (filters.asset) {
			where.asset = filters.asset
		}
		return await prisma.maintenanceLog.findMany({
			where,
			orderBy: { createdAt: 'desc' },
		})
	}
}
