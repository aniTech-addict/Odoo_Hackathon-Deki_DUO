import { z } from 'zod'

export const createTripSchema = z.object({
	route: z.string().min(3, 'Enter a route name'),
	origin: z.string().min(3, 'Enter an origin'),
	destination: z.string().min(3, 'Enter a destination'),
	vehiclePlate: z.string().min(5, 'Pick a vehicle'),
	driver: z.string().min(3, 'Assign a driver'),
	departure: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM'),
	cargoWeight: z.coerce.number().positive('Cargo weight must be positive'),
	plannedDistance: z.coerce.number().positive('Planned distance must be positive'),
	status: z.enum(['Draft', 'Dispatched', 'Completed', 'Cancelled']).default('Draft'),
	progress: z.coerce.number().min(0).max(100).default(0),
})

export const updateTripSchema = createTripSchema.partial()

export type CreateTripInput = z.infer<typeof createTripSchema>
export type UpdateTripInput = z.infer<typeof updateTripSchema>
