import { z } from 'zod'

export const createExpenseSchema = z.object({
	category: z.string().min(3, 'Category must be at least 3 characters'),
	asset: z.string().min(3, 'Asset must be at least 3 characters'),
	amount: z.coerce.number().positive('Amount must be positive'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
	note: z.string().min(3, 'Note must be at least 3 characters'),
})

export const updateExpenseSchema = createExpenseSchema.partial()

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
