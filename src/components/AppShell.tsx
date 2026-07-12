import type { PageKey, TripRecord, VehicleRecord } from '../lib/schemas'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { DashboardPage } from '../pages/DashboardPage'
import { VehiclesPage } from '../pages/VehiclesPage'
import { TripsPage } from '../pages/TripsPage'
import { MaintenancePage } from '../pages/MaintenancePage'
import { ExpensesPage } from '../pages/ExpensesPage'
import { AnalyticsPage } from '../pages/AnalyticsPage'

interface AppShellProps {
	activePage: PageKey
	setActivePage: (page: PageKey) => void
	pageTitle: string
	pageDescription: string
	plateQuery: string
	setPlateQuery: (query: string) => void
	vehicleStatus: string
	setVehicleStatus: (status: string) => void
	vehicleType: string
	setVehicleType: (type: string) => void
	overview: {
		fleet: number
		activeVehicles: number
		inService: number
		upcomingTrips: number
	}
	vehicles: VehicleRecord[]
	trips: TripRecord[]
	maintenanceLogs: any[]
	expenseLogs: any[]
	filteredVehicles: VehicleRecord[]
	handleAddVehicle: (vehicle: VehicleRecord) => void
	handleAddTrip: (trip: TripRecord) => void
}

export function AppShell({
	activePage,
	setActivePage,
	pageTitle,
	pageDescription,
	plateQuery,
	setPlateQuery,
	vehicleStatus,
	setVehicleStatus,
	vehicleType,
	setVehicleType,
	overview,
	vehicles,
	trips,
	maintenanceLogs,
	expenseLogs,
	filteredVehicles,
	handleAddVehicle,
	handleAddTrip,
}: AppShellProps) {
	return (
		<div className="app-shell">
			<Sidebar activePage={activePage} onNavigate={setActivePage} />
			<div className="workspace">
				<TopBar
					pageKey={activePage}
					title={pageTitle}
					description={pageDescription}
					searchQuery={activePage === 'vehicles' ? plateQuery : undefined}
					searchLabel={activePage === 'vehicles' ? 'Search plate number' : undefined}
					searchPlaceholder={
						activePage === 'vehicles' ? 'Search by plate number' : undefined
					}
					onSearchChange={activePage === 'vehicles' ? setPlateQuery : undefined}
					statusFilter={activePage === 'vehicles' ? vehicleStatus : undefined}
					statusOptions={
						activePage === 'vehicles'
							? [
									{ label: 'Active', value: 'Active' },
									{ label: 'Inspection', value: 'Inspection' },
									{ label: 'Maintenance', value: 'Maintenance' },
								]
							: undefined
					}
					onStatusChange={activePage === 'vehicles' ? setVehicleStatus : undefined}
					typeFilter={activePage === 'vehicles' ? vehicleType : undefined}
					typeOptions={
						activePage === 'vehicles'
							? [
									{ label: 'Bus', value: 'Bus' },
									{ label: 'Minibus', value: 'Minibus' },
									{ label: 'Truck', value: 'Truck' },
									{ label: 'Van', value: 'Van' },
								]
							: undefined
					}
					onTypeChange={activePage === 'vehicles' ? setVehicleType : undefined}
					leftActions={
						activePage === 'dashboard'
							? [
									{ label: 'Refresh board', tone: 'secondary' },
									{ label: 'New deployment', tone: 'primary' },
								]
							: activePage === 'trips'
								? [
										{ label: 'Dispatch trip', tone: 'primary' },
										{ label: 'Trip manifest', tone: 'secondary' },
									]
								: activePage === 'maintenance'
									? [
											{ label: 'Open work order', tone: 'primary' },
											{ label: 'Service log', tone: 'secondary' },
										]
									: activePage === 'expenses'
										? [
												{ label: 'Add expense', tone: 'primary' },
												{ label: 'Export ledger', tone: 'secondary' },
											]
										: activePage === 'analytics'
											? [
													{ label: 'Compare trends', tone: 'secondary' },
													{ label: 'Export report', tone: 'primary' },
												]
											: undefined
					}
				/>
				<main className="workspace__main">
					{activePage === 'dashboard' && (
						<DashboardPage
							overview={overview}
							vehicles={vehicles}
							trips={trips}
							maintenanceLogs={maintenanceLogs}
							expenseLogs={expenseLogs}
						/>
					)}
					{activePage === 'vehicles' && (
						<VehiclesPage
							vehicles={filteredVehicles}
							totalFleet={vehicles.length}
							onAddVehicle={handleAddVehicle}
							plateQuery={plateQuery}
							statusFilter={vehicleStatus}
							typeFilter={vehicleType}
						/>
					)}
					{activePage === 'trips' && (
						<TripsPage trips={trips} vehicles={vehicles} onAddTrip={handleAddTrip} />
					)}
					{activePage === 'maintenance' && (
						<MaintenancePage maintenanceLogs={maintenanceLogs} vehicles={vehicles} />
					)}
					{activePage === 'expenses' && (
						<ExpensesPage expenseLogs={expenseLogs} maintenanceLogs={maintenanceLogs} />
					)}
					{activePage === 'analytics' && (
						<AnalyticsPage
							vehicles={vehicles}
							trips={trips}
							maintenanceLogs={maintenanceLogs}
						/>
					)}
				</main>
			</div>
		</div>
	)
}
