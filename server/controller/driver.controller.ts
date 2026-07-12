import { Request, Response } from 'express'
import { z } from 'zod'
import { createDriverSchema, updateDriverSchema } from '../schemas/driver.schema.js'
import { DriverService } from '../services/driver.service.js'

const getErrorMessage = (error: unknown, fallback: string) => {
	return error instanceof Error ? error.message : fallback
}

export const registerDriver = async (req: Request, res: Response) => {
	try {
		const parsed = createDriverSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid driver data',
				errors: z.treeifyError(parsed.error),
			})
		}

		const driver = await DriverService.createDriver(parsed.data)
		return res.status(201).json({
			status: 'success',
			message: 'Driver registered successfully',
			data: driver,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error registering driver'),
		})
	}
}

export const updateDriver = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		const parsed = updateDriverSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid update data',
				errors: z.treeifyError(parsed.error),
			})
		}

		const driver = await DriverService.updateDriver(id, parsed.data)
		return res.status(200).json({
			status: 'success',
			message: 'Driver updated successfully',
			data: driver,
		})
	} catch (error: unknown) {
		const message = getErrorMessage(error, 'Error updating driver')
		const statusCode = message === 'Driver not found' ? 404 : 400
		return res.status(statusCode).json({
			status: 'failed',
			message,
		})
	}
}

export const deleteDriver = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		await DriverService.deleteDriver(id)
		return res.status(200).json({
			status: 'success',
			message: 'Driver deleted successfully',
		})
	} catch (error: unknown) {
		const message = getErrorMessage(error, 'Error deleting driver')
		const statusCode = message === 'Driver not found' ? 404 : 400
		return res.status(statusCode).json({
			status: 'failed',
			message,
		})
	}
}

export const getDriver = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		const driver = await DriverService.getDriverById(id)
		if (!driver) {
			return res.status(404).json({
				status: 'failed',
				message: 'Driver not found',
			})
		}
		return res.status(200).json({
			status: 'success',
			data: driver,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error fetching driver'),
		})
	}
}

export const getDrivers = async (req: Request, res: Response) => {
	try {
		const status = req.query.status as string | undefined
		const drivers = await DriverService.listDrivers({ status })
		return res.status(200).json({
			status: 'success',
			count: drivers.length,
			data: drivers,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error listing drivers'),
		})
	}
}
