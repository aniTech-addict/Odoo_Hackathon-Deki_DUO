import { useState, type FormEvent } from 'react'
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
	const [form, setForm] = useState<TripInput>(() => createTripForm(vehicles))
	const [errors, setErrors] = useState<Partial<Record<keyof TripInput, string>>>({})

	const activeTrips = trips.filter((trip) => trip.status !== 'Completed').length

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		const result = tripSchema.safeParse(form)

		if (!result.success) {
			const fieldErrors: Partial<Record<keyof TripInput, string>> = {}

			for (const issue of result.error.issues) {
				const field = issue.path[0] as keyof TripInput | undefined

				if (field && !fieldErrors[field]) {
					fieldErrors[field] = issue.message
				}
			}

			setErrors(fieldErrors)
			return
		}

		onAddTrip({
			...result.data,
			id: `TRP-${Date.now().toString().slice(-5)}`,
			progress: 10,
		})
		setErrors({})
		setForm(createTripForm(vehicles))
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
					<form className="stack" onSubmit={handleSubmit}>
						<div className="field-grid">
							<Field
								label="Route"
								id="trip-route"
								placeholder="Central loop"
								value={form.route}
								error={errors.route}
								onChange={(value) =>
									setForm((current) => ({ ...current, route: value }))
								}
							/>
							<Field
								label="Origin"
								id="trip-origin"
								placeholder="CBD terminal"
								value={form.origin}
								error={errors.origin}
								onChange={(value) =>
									setForm((current) => ({ ...current, origin: value }))
								}
							/>
							<Field
								label="Destination"
								id="trip-destination"
								placeholder="West gate"
								value={form.destination}
								error={errors.destination}
								onChange={(value) =>
									setForm((current) => ({ ...current, destination: value }))
								}
							/>
							<Field
								label="Departure"
								id="trip-departure"
								type="time"
								value={form.departure}
								error={errors.departure}
								onChange={(value) =>
									setForm((current) => ({ ...current, departure: value }))
								}
							/>
							<Field
								label="Vehicle"
								id="trip-vehicle"
								value={form.vehiclePlate}
								error={errors.vehiclePlate}
								options={vehicles.map((vehicle) => ({
									label: vehicle.plate,
									value: vehicle.plate,
								}))}
								onChange={(value) => {
									const matchedVehicle = vehicles.find(
										(vehicle) => vehicle.plate === value
									)
									setForm((current) => ({
										...current,
										vehiclePlate: value,
										driver: matchedVehicle?.driver ?? current.driver,
									}))
								}}
							/>
							<Field
								label="Driver"
								id="trip-driver"
								placeholder="Assigned driver"
								value={form.driver}
								error={errors.driver}
								onChange={(value) =>
									setForm((current) => ({ ...current, driver: value }))
								}
							/>
							<Field
								label="Load (%)"
								id="trip-load"
								type="number"
								value={String(form.load)}
								error={errors.load}
								onChange={(value) =>
									setForm((current) => ({ ...current, load: Number(value) }))
								}
							/>
							<Field
								label="Status"
								id="trip-status"
								value={form.status}
								options={[
									{ label: 'Scheduled', value: 'Scheduled' },
									{ label: 'Boarding', value: 'Boarding' },
									{ label: 'In Transit', value: 'In Transit' },
									{ label: 'Completed', value: 'Completed' },
								]}
								error={errors.status}
								onChange={(value) =>
									setForm((current) => ({
										...current,
										status: value as TripInput['status'],
									}))
								}
							/>
						</div>

						<div className="button-row">
							<button className="button button--primary" type="submit">
								Dispatch trip
							</button>
							<button
								className="button button--secondary"
								type="button"
								onClick={() => setForm(createTripForm(vehicles))}
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
