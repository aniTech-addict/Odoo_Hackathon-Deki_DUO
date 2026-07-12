import { z } from 'zod'

export const pageSchema = z.enum([
	'dashboard',
	'vehicles',
	'trips',
	'maintenance',
	'expenses',
	'analytics',
])

export type PageKey = z.infer<typeof pageSchema>

export const capacitySchema = z.object({
	amount: z.coerce.number().positive('Capacity amount must be a positive number'),
	unit: z.enum(['kg', 'ton'], {
		message: "Capacity unit must be either 'kg' or 'ton'",
	}),
})

export const costSchema = z.object({
	amount: z.coerce.number().nonnegative('Cost must be a non-negative number'),
	currency: z.enum(['dollars', 'rupees'], {
		message: "Currency must be either 'dollars' or 'rupees'",
	}).default('rupees'),
})

export const vehicleSchema = z.object({
	registrationNumber: z.string().min(1, 'Registration number is required'),
	model: z.string().min(1, 'Model name is required'),
	type: z.array(z.string()).min(1, 'At least one vehicle type must be selected'),
	capacity: capacitySchema,
	odometer: z.coerce.number().nonnegative('Odometer reading must be a non-negative number'),
	acquirementCost: costSchema,
	status: z.enum(['available', 'on trip', 'in shop', 'retired'], {
		message: "Status must be: 'available', 'on trip', 'in shop', or 'retired'",
	}).default('available'),
})

export type VehicleInput = z.infer<typeof vehicleSchema>

export type VehicleRecord = VehicleInput & {
	_id: string
}

export const tripSchema = z.object({
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

export type TripInput = z.infer<typeof tripSchema>

export type TripRecord = TripInput & {
	_id: string
}

export const maintenanceSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters'),
	asset: z.string().min(3, 'Asset plate or reference is required'),
	status: z.enum(['Scheduled', 'In Service', 'Complete']).default('Scheduled'),
	cost: z.coerce.number().nonnegative('Cost cannot be negative'),
	nextCheck: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
})

export type MaintenanceInput = z.infer<typeof maintenanceSchema>

export type MaintenanceRecord = MaintenanceInput & {
	_id: string
}

export const expenseSchema = z.object({
	category: z.string().min(3, 'Category must be at least 3 characters'),
	asset: z.string().min(3, 'Asset must be at least 3 characters'),
	amount: z.coerce.number().positive('Amount must be positive'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
	note: z.string().min(3, 'Note must be at least 3 characters'),
})

export type ExpenseInput = z.infer<typeof expenseSchema>

export type ExpenseRecord = ExpenseInput & {
	_id: string
}
