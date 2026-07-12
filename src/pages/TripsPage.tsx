import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DataTable } from '../components/DataTable'
import { Field } from '../components/Field'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { tripSchema, type TripInput, type TripRecord, type VehicleRecord } from '../lib/schemas'

type TripsPageProps = {
	trips: TripRecord[]
	vehicles: VehicleRecord[]
	onAddTrip: (trip: TripRecord) => void
}

const createTripForm = (vehicles: VehicleRecord[]): TripInput => ({
	route: '',
	origin: '',
	destination: '',
	vehiclePlate: vehicles[0]?.plate ?? '',
	driver: vehicles[0]?.driver ?? '',
	departure: '',
	load: 0,
	status: 'Scheduled',
})

export function TripsPage({ trips, vehicles, onAddTrip }: TripsPageProps) {
	const {
		control,
		handleSubmit,
		reset,
		setValue,
	} = useForm<TripInput>({
		resolver: zodResolver(tripSchema),
		defaultValues: createTripForm(vehicles),
	})

	const activeTrips = trips.filter((trip) => trip.status !== 'Completed').length

	const onSubmit = (data: TripInput) => {
		onAddTrip({
			...data,
			id: `TRP-${Date.now().toString().slice(-5)}`,
			progress: 10,
		})
		reset(createTripForm(vehicles))
	}

	return (
		<div className="stack">
			<div className="layout-grid layout-grid--stats">
				<StatCard
					label="Active trips"
					value={String(activeTrips)}
					meta="Currently not completed"
					icon="route"
					tone="success"
				/>
				<StatCard
					label="Scheduled"
					value={String(trips.filter((trip) => trip.status === 'Scheduled').length)}
					meta="Awaiting dispatch"
					icon="truck"
					tone="warning"
				/>
				<StatCard
					label="Board count"
					value={String(trips.length)}
					meta="All trips currently on the board"
					icon="chart"
					tone="neutral"
				/>
				<StatCard
					label="Average load"
					value={`${Math.round(trips.reduce((sum, trip) => sum + trip.load, 0) / Math.max(trips.length, 1))}%`}
					meta="Estimated capacity usage"
					icon="wallet"
					tone="neutral"
				/>
			</div>

			<div className="layout-grid layout-grid--two">
				<SectionCard
					title="Live trip board"
					subtitle="Track scheduled and in-flight movement across the fleet."
					className="table-card"
				>
					<DataTable
						rows={trips}
						columns={[
							{ head: 'Route', render: (trip) => trip.route },
							{ head: 'Vehicle', render: (trip) => trip.vehiclePlate },
							{ head: 'Driver', render: (trip) => trip.driver },
							{ head: 'Departure', render: (trip) => trip.departure },
							{
								head: 'Status',
								render: (trip) => <StatusBadge status={trip.status} />,
							},
							{ head: 'Load', render: (trip) => `${trip.load}%` },
						]}
						emptyState="No trips match the current filter"
					/>
				</SectionCard>

				<SectionCard
					title="Dispatch trip"
					subtitle="Validated by Zod before the trip enters the board."
				>
					<form className="stack" onSubmit={handleSubmit(onSubmit)}>
						<div className="field-grid">
							<Controller
								control={control}
								name="route"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Route"
										id="trip-route"
										placeholder="Central loop"
										value={value}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name="origin"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Origin"
										id="trip-origin"
										placeholder="CBD terminal"
										value={value}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name="destination"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Destination"
										id="trip-destination"
										placeholder="West gate"
										value={value}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name="departure"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Departure"
										id="trip-departure"
										type="time"
										value={value}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name="vehiclePlate"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Vehicle"
										id="trip-vehicle"
										value={value}
										error={error?.message}
										options={vehicles.map((vehicle) => ({
											label: vehicle.plate,
											value: vehicle.plate,
										}))}
										onChange={(val) => {
											onChange(val)
											const matchedVehicle = vehicles.find(
												(vehicle) => vehicle.plate === val
											)
											if (matchedVehicle?.driver) {
												setValue('driver', matchedVehicle.driver, { shouldValidate: true })
											}
										}}
									/>
								)}
							/>
							<Controller
								control={control}
								name="driver"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Driver"
										id="trip-driver"
										placeholder="Assigned driver"
										value={value}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name="load"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Load (%)"
										id="trip-load"
										type="number"
										value={value}
										error={error?.message}
										onChange={(val) => onChange(Number(val))}
									/>
								)}
							/>
							<Controller
								control={control}
								name="status"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Status"
										id="trip-status"
										value={value}
										options={[
											{ label: 'Scheduled', value: 'Scheduled' },
											{ label: 'Boarding', value: 'Boarding' },
											{ label: 'In Transit', value: 'In Transit' },
											{ label: 'Completed', value: 'Completed' },
										]}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
						</div>

						<div className="button-row">
							<button className="button button--primary" type="submit">
								Dispatch trip
							</button>
							<button
								className="button button--secondary"
								type="button"
								onClick={() => reset(createTripForm(vehicles))}
							>
								Reset form
							</button>
						</div>
					</form>
				</SectionCard>
			</div>
		</div>
	)
}
