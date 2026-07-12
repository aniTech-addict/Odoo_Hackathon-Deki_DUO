import { z } from 'zod'

export const createDriverSchema = z.object({
	name: z.string().min(3, 'Enter name'),
	licenseNumber: z.string().min(5, 'Enter license number'),
	licenseCategory: z.string().min(1, 'Category is required'),
	licenseExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
	contactNumber: z.string().min(5, 'Enter contact number'),
	safetyScore: z.coerce.number().min(0).max(100).default(100),
	status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']).default('Available'),
})

export const updateDriverSchema = createDriverSchema.partial()

export type CreateDriverInput = z.infer<typeof createDriverSchema>
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>
