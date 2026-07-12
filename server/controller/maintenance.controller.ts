import { Request, Response } from 'express'
import { z } from 'zod'
import { createMaintenanceSchema, updateMaintenanceSchema } from '../schemas/maintenance.schema.js'
import { MaintenanceService } from '../services/maintenance.service.js'

const getErrorMessage = (error: unknown, fallback: string) => {
	return error instanceof Error ? error.message : fallback
}

export const createMaintenanceLog = async (req: Request, res: Response) => {
	try {
		const parsed = createMaintenanceSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid maintenance data',
				errors: z.treeifyError(parsed.error),
			})
		}

		const log = await MaintenanceService.createMaintenanceLog(parsed.data)
		return res.status(201).json({
			status: 'success',
			message: 'Maintenance log created successfully',
			data: log,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error creating maintenance log'),
		})
	}
}

export const updateMaintenanceLog = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		const parsed = updateMaintenanceSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid update data',
				errors: z.treeifyError(parsed.error),
			})
		}

		const log = await MaintenanceService.updateMaintenanceLog(id, parsed.data)
		return res.status(200).json({
			status: 'success',
			message: 'Maintenance log updated successfully',
			data: log,
		})
	} catch (error: unknown) {
		const message = getErrorMessage(error, 'Error updating maintenance log')
		const statusCode = message === 'Maintenance log not found' ? 404 : 400
		return res.status(statusCode).json({
			status: 'failed',
			message,
		})
	}
}

export const deleteMaintenanceLog = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		await MaintenanceService.deleteMaintenanceLog(id)
		return res.status(200).json({
			status: 'success',
			message: 'Maintenance log deleted successfully',
		})
	} catch (error: unknown) {
		const message = getErrorMessage(error, 'Error deleting maintenance log')
		const statusCode = message === 'Maintenance log not found' ? 404 : 400
		return res.status(statusCode).json({
			status: 'failed',
			message,
		})
	}
}

export const getMaintenanceLog = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		const log = await MaintenanceService.getMaintenanceLogById(id)
		if (!log) {
			return res.status(404).json({
				status: 'failed',
				message: 'Maintenance log not found',
			})
		}
		return res.status(200).json({
			status: 'success',
			data: log,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error fetching maintenance log'),
		})
	}
}

export const getMaintenanceLogs = async (req: Request, res: Response) => {
	try {
		const status = req.query.status as string | undefined
		const asset = req.query.asset as string | undefined
		const logs = await MaintenanceService.listMaintenanceLogs({ status, asset })
		return res.status(200).json({
			status: 'success',
			count: logs.length,
			data: logs,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error listing maintenance logs'),
		})
	}
}
