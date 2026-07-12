import prisma from '../db/prisma.js'
import { CreateTripInput, UpdateTripInput } from '../schemas/trip.schema.js'

export class TripService {
	static async createTrip(data: CreateTripInput) {
		return await prisma.$transaction(async (tx) => {
			const trip = await tx.trip.create({
				data: {
					route: data.route,
					origin: data.origin,
					destination: data.destination,
					vehiclePlate: data.vehiclePlate,
					driver: data.driver,
					departure: data.departure,
					cargoWeight: data.cargoWeight,
					plannedDistance: data.plannedDistance,
					status: data.status,
					progress: data.progress,
				},
			})

			// Handle status transitions on creation
			if (data.status === 'Dispatched') {
				// Mark vehicle on trip
				await tx.vehicle.updateMany({
					where: { registrationNumber: data.vehiclePlate },
					data: { status: 'on trip' },
				})
				// Mark driver on trip
				await tx.driver.updateMany({
					where: { name: data.driver },
					data: { status: 'On Trip' },
				})
			}

			return trip
		})
	}

	static async updateTrip(id: string, data: UpdateTripInput) {
		return await prisma.$transaction(async (tx) => {
			const existingTrip = await tx.trip.findUnique({ where: { id } })
			if (!existingTrip) {
				throw new Error('Trip not found')
			}

			const updatedTrip = await tx.trip.update({
				where: { id },
				data,
			})

			// Check if status changed
			if (data.status && data.status !== existingTrip.status) {
				const oldStatus = existingTrip.status
				const newStatus = data.status

				// Transition out of Dispatched
				if (oldStatus === 'Dispatched') {
					if (newStatus === 'Completed') {
						// Vehicle becomes available, increase odometer
						const vehicle = await tx.vehicle.findUnique({
							where: { registrationNumber: existingTrip.vehiclePlate },
						})
						if (vehicle) {
							await tx.vehicle.update({
								where: { id: vehicle.id },
								data: {
									status: 'available',
									odometer: vehicle.odometer + existingTrip.plannedDistance,
								},
							})
						}
						// Driver becomes available
						await tx.driver.updateMany({
							where: { name: existingTrip.driver },
							data: { status: 'Available' },
						})
					} else if (newStatus === 'Cancelled' || newStatus === 'Draft') {
						// Vehicle and driver become available
						await tx.vehicle.updateMany({
							where: { registrationNumber: existingTrip.vehiclePlate },
							data: { status: 'available' },
						})
						await tx.driver.updateMany({
							where: { name: existingTrip.driver },
							data: { status: 'Available' },
						})
					}
				}

				// Transition into Dispatched
				if (newStatus === 'Dispatched') {
					await tx.vehicle.updateMany({
						where: { registrationNumber: updatedTrip.vehiclePlate },
						data: { status: 'on trip' },
					})
					await tx.driver.updateMany({
						where: { name: updatedTrip.driver },
						data: { status: 'On Trip' },
					})
				}
			}

			return updatedTrip
		})
	}

	static async deleteTrip(id: string) {
		return await prisma.$transaction(async (tx) => {
			const trip = await tx.trip.findUnique({ where: { id } })
			if (!trip) {
				throw new Error('Trip not found')
			}

			if (trip.status === 'Dispatched') {
				// Revert vehicle/driver to available
				await tx.vehicle.updateMany({
					where: { registrationNumber: trip.vehiclePlate },
					data: { status: 'available' },
				})
				await tx.driver.updateMany({
					where: { name: trip.driver },
					data: { status: 'Available' },
				})
			}

			return await tx.trip.delete({ where: { id } })
		})
	}

	static async getTripById(id: string) {
		return await prisma.trip.findUnique({ where: { id } })
	}

	static async listTrips(filters: { status?: string }) {
		const where: { status?: string } = {}
		if (filters.status) {
			where.status = filters.status
		}
		return await prisma.trip.findMany({
			where,
			orderBy: { createdAt: 'desc' },
		})
	}
}
