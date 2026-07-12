import { Request, Response } from 'express'
import { z } from 'zod'
import { createExpenseSchema, updateExpenseSchema } from '../schemas/expense.schema.js'
import { ExpenseService } from '../services/expense.service.js'

const getErrorMessage = (error: unknown, fallback: string) => {
	return error instanceof Error ? error.message : fallback
}

export const createExpense = async (req: Request, res: Response) => {
	try {
		const parsed = createExpenseSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid expense data',
				errors: z.treeifyError(parsed.error),
			})
		}

		const expense = await ExpenseService.createExpense(parsed.data)
		return res.status(201).json({
			status: 'success',
			message: 'Expense record created successfully',
			data: expense,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error creating expense record'),
		})
	}
}

export const updateExpense = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		const parsed = updateExpenseSchema.safeParse(req.body)
		if (!parsed.success) {
			return res.status(400).json({
				status: 'failed',
				message: 'Invalid update data',
				errors: z.treeifyError(parsed.error),
			})
		}

		const expense = await ExpenseService.updateExpense(id, parsed.data)
		return res.status(200).json({
			status: 'success',
			message: 'Expense record updated successfully',
			data: expense,
		})
	} catch (error: unknown) {
		const message = getErrorMessage(error, 'Error updating expense record')
		const statusCode = message === 'Expense record not found' ? 404 : 400
		return res.status(statusCode).json({
			status: 'failed',
			message,
		})
	}
}

export const deleteExpense = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		await ExpenseService.deleteExpense(id)
		return res.status(200).json({
			status: 'success',
			message: 'Expense record deleted successfully',
		})
	} catch (error: unknown) {
		const message = getErrorMessage(error, 'Error deleting expense record')
		const statusCode = message === 'Expense record not found' ? 404 : 400
		return res.status(statusCode).json({
			status: 'failed',
			message,
		})
	}
}

export const getExpense = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		const expense = await ExpenseService.getExpenseById(id)
		if (!expense) {
			return res.status(404).json({
				status: 'failed',
				message: 'Expense record not found',
			})
		}
		return res.status(200).json({
			status: 'success',
			data: expense,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error fetching expense record'),
		})
	}
}

export const getExpenses = async (req: Request, res: Response) => {
	try {
		const category = req.query.category as string | undefined
		const asset = req.query.asset as string | undefined
		const expenses = await ExpenseService.listExpenses({ category, asset })
		return res.status(200).json({
			status: 'success',
			count: expenses.length,
			data: expenses,
		})
	} catch (error: unknown) {
		return res.status(400).json({
			status: 'failed',
			message: getErrorMessage(error, 'Error listing expenses'),
		})
	}
}
