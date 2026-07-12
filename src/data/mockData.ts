import type {
	ExpenseRecord,
	MaintenanceRecord,
	PageKey,
	TripRecord,
	VehicleRecord,
} from '../lib/schemas'

export const dashboardPages: Array<{
	id: PageKey
	title: string
	description: string
}> = [
	{
		id: 'dashboard',
		title: 'Fleet Command Center',
		description: 'Operational overview for live assets, trips, and work orders.',
	},
	{
		id: 'vehicles',
		title: 'Vehicle Registry',
		description: 'Track fleet readiness, assign drivers, and schedule service windows.',
	},
	{
		id: 'trips',
		title: 'Trip Management',
		description: 'Dispatch routes, monitor departures, and keep load planning tight.',
	},
	{
		id: 'maintenance',
		title: 'Maintenance',
		description: 'Prioritize maintenance queues and service-turnaround visibility.',
	},
	{
		id: 'expenses',
		title: 'Fuel & Expenses',
		description: 'Review expenditure patterns across fleet fuel, repairs, and parts.',
	},
	{
		id: 'analytics',
		title: 'Analytics',
		description: 'Surface utilization, turnaround, and service-performance trends.',
	},
]

export const navigationItems = [
	{ id: 'dashboard' as const, label: 'Dashboard', icon: 'dashboard' },
	{ id: 'vehicles' as const, label: 'Vehicle Registry', icon: 'fleet' },
	{ id: 'trips' as const, label: 'Trip Management', icon: 'route' },
	{ id: 'maintenance' as const, label: 'Maintenance', icon: 'wrench' },
	{ id: 'expenses' as const, label: 'Fuel & Expenses', icon: 'wallet' },
	{ id: 'analytics' as const, label: 'Analytics', icon: 'chart' },
]

export const seedVehicles: VehicleRecord[] = [
	{
		id: 'VEH-1001',
		plate: 'KDA-112A',
		vehicleType: 'Bus',
		driver: 'Alex Muriuki',
		route: 'Central Loop',
		status: 'Active',
		mileage: 182400,
		nextService: '2026-07-21',
		utilization: 82,
	},
	{
		id: 'VEH-1002',
		plate: 'KBC-334T',
		vehicleType: 'Minibus',
		driver: 'Zara Njeri',
		route: 'Airport Shuttle',
		status: 'Inspection',
		mileage: 146220,
		nextService: '2026-07-14',
		utilization: 69,
	},
	{
		id: 'VEH-1003',
		plate: 'KDJ-889P',
		vehicleType: 'Truck',
		driver: 'Peter Otieno',
		route: 'North Cargo Line',
		status: 'Maintenance',
		mileage: 214630,
		nextService: '2026-07-12',
		utilization: 54,
	},
	{
		id: 'VEH-1004',
		plate: 'KDM-421V',
		vehicleType: 'Van',
		driver: 'Hannah Wanjiru',
		route: 'Staff Support',
		status: 'Active',
		mileage: 98340,
		nextService: '2026-08-02',
		utilization: 77,
	},
]

export const seedTrips: TripRecord[] = [
	{
		id: 'TRP-301',
		route: 'Central Loop',
		origin: 'CBD Terminal',
		destination: 'West Gate',
		vehiclePlate: 'KDA-112A',
		driver: 'Alex Muriuki',
		departure: '07:30',
		load: 38,
		status: 'In Transit',
		progress: 74,
	},
	{
		id: 'TRP-302',
		route: 'Airport Shuttle',
		origin: 'City Center',
		destination: 'International Airport',
		vehiclePlate: 'KBC-334T',
		driver: 'Zara Njeri',
		departure: '09:15',
		load: 24,
		status: 'Boarding',
		progress: 38,
	},
	{
		id: 'TRP-303',
		route: 'North Cargo Line',
		origin: 'Warehouse 4',
		destination: 'Industrial Park',
		vehiclePlate: 'KDJ-889P',
		driver: 'Peter Otieno',
		departure: '11:00',
		load: 48,
		status: 'Scheduled',
		progress: 12,
	},
]

export const seedMaintenanceLogs: MaintenanceRecord[] = [
	{
		id: 'MT-401',
		title: 'Brake line inspection',
		asset: 'KDJ-889P',
		status: 'In Service',
		cost: 980,
		nextCheck: '2026-07-18',
	},
	{
		id: 'MT-402',
		title: 'Battery replacement',
		asset: 'KDA-112A',
		status: 'Scheduled',
		cost: 430,
		nextCheck: '2026-07-16',
	},
	{
		id: 'MT-403',
		title: 'Cabin filter service',
		asset: 'KDM-421V',
		status: 'Complete',
		cost: 170,
		nextCheck: '2026-08-03',
	},
]

export const seedExpenseLogs: ExpenseRecord[] = [
	{
		id: 'EXP-501',
		category: 'Fuel',
		asset: 'KDA-112A',
		amount: 420,
		date: '2026-07-11',
		note: 'Night refuel before early dispatch',
	},
	{
		id: 'EXP-502',
		category: 'Parts',
		asset: 'KDJ-889P',
		amount: 890,
		date: '2026-07-10',
		note: 'Brake pads and fasteners',
	},
	{
		id: 'EXP-503',
		category: 'Repair',
		asset: 'KBC-334T',
		amount: 210,
		date: '2026-07-09',
		note: 'Air-conditioning service',
	},
]
