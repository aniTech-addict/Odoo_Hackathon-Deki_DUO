import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import prisma from '../db/prisma.js'
import {
	createExpense,
	updateExpense,
	deleteExpense,
	getExpenses,
} from '../controller/expense.controller.js'

type MockResponse = {
	statusCode?: number
	jsonData?: any
	status: (code: number) => MockResponse
	json: (data: any) => MockResponse
}

describe('Expense Ledger Integration Logic', () => {
	const testAssets = ['TEST-VEH1']

	beforeAll(async () => {
		await prisma.expense.deleteMany({
			where: { asset: { in: testAssets } },
		})
	})

	afterAll(async () => {
		await prisma.expense.deleteMany({
			where: { asset: { in: testAssets } },
		})
	})

	beforeEach(async () => {
		await prisma.expense.deleteMany({
			where: { asset: { in: testAssets } },
		})
	})

	const mockRes = () => {
		const res = {} as MockResponse
		res.status = jest.fn().mockImplementation((code: number) => {
			res.statusCode = code
			return res
		})
		res.json = jest.fn().mockImplementation((data: any) => {
			res.jsonData = data
			return res
		})
		return res
	}

	it('should record an expense successfully', async () => {
		const req = {
			body: {
				category: 'Fuel',
				asset: 'TEST-VEH1',
				amount: 150.5,
				date: '2026-07-12',
				note: 'Full tank refuel',
			},
		} as const
		const res = mockRes()

		await createExpense(req, res)

		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.jsonData.status).toBe('success')
		expect(res.jsonData.data.category).toBe('Fuel')

		const dbExpense = await prisma.expense.findFirst({ where: { asset: 'TEST-VEH1' } })
		expect(dbExpense).toBeDefined()
		expect(dbExpense?.amount).toBe(150.5)
	})

	it('should retrieve recorded expenses list', async () => {
		await prisma.expense.create({
			data: {
				category: 'Repair',
				asset: 'TEST-VEH1',
				amount: 300,
				date: '2026-07-12',
				note: 'Brake pad swap',
			},
		})

		const req = { query: { asset: 'TEST-VEH1' } } as any
		const res = mockRes()

		await getExpenses(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.jsonData.count).toBe(1)
		expect(res.jsonData.data[0].category).toBe('Repair')
	})
})
