import { z } from 'zod'

export const capacitySchema = z.object({
	amount: z.number().positive('Capacity amount must be a positive number'),
	unit: z.enum(['kg', 'ton'], {
		message: "Capacity unit must be either 'kg' or 'ton'",
	}),
})

export const costSchema = z.object({
	amount: z.number().nonnegative('Cost must be a non-negative number'),
	currency: z.enum(['dollars', 'rupees'], {
		message: "Currency must be either 'dollars' or 'rupees'",
	}).default('rupees'),
})

export const createVehicleSchema = z.object({
	registrationNumber: z.string().min(1, 'Registration number is required'),
	model: z.string().min(1, 'Model name is required'),
	type: z.array(z.string()).min(1, 'At least one vehicle type must be selected'),
	capacity: capacitySchema,
	odometer: z.number().nonnegative('Odometer reading must be a non-negative number'),
	acquirementCost: costSchema,
	status: z.enum(['available', 'on trip', 'in shop', 'retired'], {
		message: "Status must be: 'available', 'on trip', 'in shop', or 'retired'",
	}).default('available'),
})

export const updateVehicleSchema = createVehicleSchema.partial()

export const getVehiclesQuerySchema = z.object({
	status: z.enum(['available', 'on trip', 'in shop', 'retired']).optional(),
	type: z.union([z.string(), z.array(z.string())]).optional(),
	model: z.string().optional(),
	minOdometer: z.coerce.number().nonnegative().optional(),
	maxOdometer: z.coerce.number().nonnegative().optional(),
	minCapacity: z.coerce.number().positive().optional(),
	maxCapacity: z.coerce.number().positive().optional(),
	capacityUnit: z.enum(['kg', 'ton']).optional(),
	minCost: z.coerce.number().nonnegative().optional(),
	maxCost: z.coerce.number().nonnegative().optional(),
	costCurrency: z.enum(['dollars', 'rupees']).optional(),
})

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>
export type GetVehiclesQueryInput = z.infer<typeof getVehiclesQuerySchema>
