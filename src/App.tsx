import { useMemo, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import {
	dashboardPages,
	seedExpenseLogs,
	seedMaintenanceLogs,
	seedTrips,
	seedVehicles,
} from './data/mockData'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { DashboardPage } from './pages/DashboardPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { MaintenancePage } from './pages/MaintenancePage'
import { TripsPage } from './pages/TripsPage'
import { VehiclesPage } from './pages/VehiclesPage'
import type { PageKey, TripRecord, VehicleRecord } from './lib/schemas'
import './App.css'

function App() {
	const [activePage, setActivePage] = useState<PageKey>('dashboard')
	const [plateQuery, setPlateQuery] = useState('')
	const [vehicleStatus, setVehicleStatus] = useState('')
	const [vehicleType, setVehicleType] = useState('')
	const [vehicles, setVehicles] = useState<VehicleRecord[]>(seedVehicles)
	const [trips, setTrips] = useState<TripRecord[]>(seedTrips)
	const [maintenanceLogs] = useState(seedMaintenanceLogs)
	const [expenseLogs] = useState(seedExpenseLogs)

	const visiblePlateQuery = plateQuery.trim().toLowerCase()

	const pageMeta = dashboardPages.find((page) => page.id === activePage)
	const pageTitle = pageMeta?.title ?? 'TransitOps'
	const pageDescription = pageMeta?.description ?? 'Fleet operations workspace'

	const overview = useMemo(
		() => ({
			fleet: vehicles.length,
			activeVehicles: vehicles.filter((vehicle) => vehicle.status === 'Active').length,
			inService: maintenanceLogs.filter((log) => log.status === 'In Service').length,
			upcomingTrips: trips.filter((trip) => trip.status === 'Scheduled').length,
		}),
		[maintenanceLogs, trips, vehicles]
	)

	const filteredVehicles = useMemo(() => {
		return vehicles.filter((vehicle) => {
			const matchesPlate = visiblePlateQuery
				? vehicle.plate.toLowerCase().includes(visiblePlateQuery)
				: true
			const matchesStatus = vehicleStatus ? vehicle.status === vehicleStatus : true
			const matchesType = vehicleType ? vehicle.vehicleType === vehicleType : true

			return matchesPlate && matchesStatus && matchesType
		})
	}, [vehicleStatus, vehicleType, vehicles, visiblePlateQuery])

	const handleAddVehicle = (vehicle: VehicleRecord) => {
		setVehicles((currentVehicles) => [vehicle, ...currentVehicles])
		setActivePage('vehicles')
	}

	const handleAddTrip = (trip: TripRecord) => {
		setTrips((currentTrips) => [trip, ...currentTrips])
		setActivePage('trips')
	}

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

export default App
