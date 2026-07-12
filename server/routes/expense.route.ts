import { Router } from 'express'
import {
	createExpense,
	updateExpense,
	deleteExpense,
	getExpense,
	getExpenses,
} from '../controller/expense.controller.js'

const expenseRouter = Router()

expenseRouter.post('/', createExpense)
expenseRouter.get('/', getExpenses)
expenseRouter.get('/:id', getExpense)
expenseRouter.put('/:id', updateExpense)
expenseRouter.delete('/:id', deleteExpense)

export default expenseRouter
