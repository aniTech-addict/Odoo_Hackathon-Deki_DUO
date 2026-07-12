import { z } from 'zod'

export const createMaintenanceSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters'),
	asset: z.string().min(3, 'Asset plate or reference is required'),
	status: z.enum(['Scheduled', 'In Service', 'Complete']).default('Scheduled'),
	cost: z.coerce.number().nonnegative('Cost cannot be negative'),
	nextCheck: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
})

export const updateMaintenanceSchema = createMaintenanceSchema.partial()

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>
