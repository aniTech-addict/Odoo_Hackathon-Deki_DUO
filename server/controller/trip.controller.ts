import { Request, Response } from 'express'
import { z } from 'zod'
import { createTripSchema, updateTripSchema } from '../schemas/trip.schema.js'
import { TripService } from '../services/trip.service.js'

const getErrorMessage = (error: unknown, fallback: string) => {
	return error instanceof Error ? error.message : fallback
}

export const registerTrip = async (req: Request, res: Response) => {
	try {
		const parsed = createTripSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid trip data',
				errors: z.treeifyError(parsed.error),
			})
		}

		const trip = await TripService.createTrip(parsed.data)
		return res.status(201).json({
			status: 'success',
			message: 'Trip registered successfully',
			data: trip,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error registering trip'),
		})
	}
}

export const updateTrip = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		const parsed = updateTripSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid update data',
				errors: z.treeifyError(parsed.error),
			})
		}

		const trip = await TripService.updateTrip(id, parsed.data)
		return res.status(200).json({
			status: 'success',
			message: 'Trip updated successfully',
			data: trip,
		})
	} catch (error: unknown) {
		const message = getErrorMessage(error, 'Error updating trip')
		const statusCode = message === 'Trip not found' ? 404 : 400
		return res.status(statusCode).json({
			status: 'failed',
			message,
		})
	}
}

export const deleteTrip = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		await TripService.deleteTrip(id)
		return res.status(200).json({
			status: 'success',
			message: 'Trip deleted successfully',
		})
	} catch (error: unknown) {
		const message = getErrorMessage(error, 'Error deleting trip')
		const statusCode = message === 'Trip not found' ? 404 : 400
		return res.status(statusCode).json({
			status: 'failed',
			message,
		})
	}
}

export const getTrip = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		const trip = await TripService.getTripById(id)
		if (!trip) {
			return res.status(404).json({
				status: 'failed',
				message: 'Trip not found',
			})
		}
		return res.status(200).json({
			status: 'success',
			data: trip,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error fetching trip'),
		})
	}
}

export const getTrips = async (req: Request, res: Response) => {
	try {
		const status = req.query.status as string | undefined
		const trips = await TripService.listTrips({ status })
		return res.status(200).json({
			status: 'success',
			count: trips.length,
			data: trips,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error listing trips'),
		})
	}
}
