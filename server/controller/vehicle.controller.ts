import { Request, Response } from 'express'
import { z } from 'zod'
import { createVehicleSchema, updateVehicleSchema, getVehiclesQuerySchema } from '../schemas/vehicle.schema.js'
import { VehicleService, VehicleFilters } from '../services/vehicle.service.js'

const getErrorMessage = (error: unknown, fallback: string) => {
	return error instanceof Error ? error.message : fallback
}

export const registerVehicle = async (req: Request, res: Response) => {
	try {
		const parsed = createVehicleSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid vehicle data',
				errors: z.treeifyError(parsed.error),
			})
		}

		const vehicle = await VehicleService.createVehicle(parsed.data)
		return res.status(201).json({
			status: 'success',
			message: 'Vehicle registered successfully',
			data: vehicle,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error registering vehicle'),
		})
	}
}

export const updateVehicle = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		const parsed = updateVehicleSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid update data',
				errors: z.treeifyError(parsed.error),
			})
		}

		const vehicle = await VehicleService.updateVehicle(id, parsed.data)
		return res.status(200).json({
			status: 'success',
			message: 'Vehicle updated successfully',
			data: vehicle,
		})
	} catch (error: unknown) {
		const message = getErrorMessage(error, 'Error updating vehicle')
		const statusCode = message === 'Vehicle not found' ? 404 : 400
		return res.status(statusCode).json({
			status: 'failed',
			message,
		})
	}
}

export const deleteVehicle = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		await VehicleService.deleteVehicle(id)
		return res.status(200).json({
			status: 'success',
			message: 'Vehicle deleted successfully',
		})
	} catch (error: unknown) {
		const message = getErrorMessage(error, 'Error deleting vehicle')
		const statusCode = message === 'Vehicle not found' ? 404 : 400
		return res.status(statusCode).json({
			status: 'failed',
			message,
		})
	}
}

export const getVehicle = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		const vehicle = await VehicleService.getVehicleById(id)
		if (!vehicle) {
			return res.status(404).json({
				status: 'failed',
				message: 'Vehicle not found',
			})
		}
		return res.status(200).json({
			status: 'success',
			data: vehicle,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error fetching vehicle'),
		})
	}
}

export const getVehicles = async (req: Request, res: Response) => {
	try {
		const parsed = getVehiclesQuerySchema.safeParse(req.query)
		if (!parsed.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid query filters',
				errors: z.treeifyError(parsed.error),
			})
		}

		const {
			status,
			type,
			model,
			minOdometer,
			maxOdometer,
			minCapacity,
			maxCapacity,
			capacityUnit,
			minCost,
			maxCost,
			costCurrency,
		} = parsed.data

		const filters: VehicleFilters = {}

		if (status) filters.status = status
		if (type) {
			filters.type = type
		}
		if (model) filters.model = model

		if (minOdometer !== undefined) filters.minOdometer = minOdometer
		if (maxOdometer !== undefined) filters.maxOdometer = maxOdometer

		if (minCapacity !== undefined) filters.minCapacity = minCapacity
		if (maxCapacity !== undefined) filters.maxCapacity = maxCapacity
		if (capacityUnit) filters.capacityUnit = capacityUnit

		if (minCost !== undefined) filters.minCost = minCost
		if (maxCost !== undefined) filters.maxCost = maxCost
		if (costCurrency) filters.costCurrency = costCurrency

		const vehicles = await VehicleService.listVehicles(filters)
		return res.status(200).json({
			status: 'success',
			count: vehicles.length,
			data: vehicles,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error listing vehicles'),
		})
	}
}
