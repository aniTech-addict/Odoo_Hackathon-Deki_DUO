import prisma from '../db/prisma.js'
import { CreateExpenseInput, UpdateExpenseInput } from '../schemas/expense.schema.js'

export class ExpenseService {
	static async createExpense(data: CreateExpenseInput) {
		return await prisma.expense.create({
			data: {
				category: data.category,
				asset: data.asset,
				amount: data.amount,
				date: data.date,
				note: data.note,
			},
		})
	}

	static async updateExpense(id: string, data: UpdateExpenseInput) {
		const expense = await prisma.expense.findUnique({ where: { id } })
		if (!expense) {
			throw new Error('Expense record not found')
		}

		return await prisma.expense.update({
			where: { id },
			data,
		})
	}

	static async deleteExpense(id: string) {
		const expense = await prisma.expense.findUnique({ where: { id } })
		if (!expense) {
			throw new Error('Expense record not found')
		}
		return await prisma.expense.delete({ where: { id } })
	}

	static async getExpenseById(id: string) {
		return await prisma.expense.findUnique({ where: { id } })
	}

	static async listExpenses(filters: { category?: string; asset?: string }) {
		const where: any = {}
		if (filters.category) {
			where.category = filters.category
		}
		if (filters.asset) {
			where.asset = filters.asset
		}
		return await prisma.expense.findMany({
			where,
			orderBy: { date: 'desc' },
		})
	}
}
