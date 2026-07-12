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

export const vehicleSchema = z.object({
	plate: z.string().min(5, 'Enter a valid plate number').max(12),
	vehicleType: z.enum(['Bus', 'Minibus', 'Truck', 'Van']),
	driver: z.string().min(3, 'Assign a driver'),
	route: z.string().min(3, 'Add a route or depot reference'),
	status: z.enum(['Active', 'Inspection', 'Maintenance']),
	mileage: z.coerce.number().int().nonnegative('Mileage cannot be negative'),
	nextService: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
	utilization: z.coerce.number().min(0).max(100),
})

export type VehicleInput = z.infer<typeof vehicleSchema>

export type VehicleRecord = VehicleInput & {
	id: string
	vehicleType: VehicleInput['vehicleType']
	status: VehicleInput['status']
}

export const tripSchema = z.object({
	route: z.string().min(3, 'Enter a route name'),
	origin: z.string().min(3, 'Enter an origin'),
	destination: z.string().min(3, 'Enter a destination'),
	vehiclePlate: z.string().min(5, 'Pick a vehicle'),
	driver: z.string().min(3, 'Assign a driver'),
	departure: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM'),
	load: z.coerce.number().positive('Load must be positive'),
	status: z.enum(['Scheduled', 'Boarding', 'In Transit', 'Completed']),
})

export type TripInput = z.infer<typeof tripSchema>

export type TripRecord = TripInput & {
	id: string
	progress: number
}

export const maintenanceSchema = z.object({
	title: z.string().min(3),
	asset: z.string().min(3),
	status: z.enum(['Scheduled', 'In Service', 'Complete']),
	cost: z.coerce.number().nonnegative(),
	nextCheck: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type MaintenanceRecord = z.infer<typeof maintenanceSchema> & { id: string }

export const expenseSchema = z.object({
	category: z.string().min(3),
	asset: z.string().min(3),
	amount: z.coerce.number().positive(),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	note: z.string().min(3),
})

export type ExpenseRecord = z.infer<typeof expenseSchema> & { id: string }
