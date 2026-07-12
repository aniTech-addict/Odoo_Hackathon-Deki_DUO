import { useMemo, useState, type FormEvent } from 'react'
import { DataTable } from '../components/DataTable'
import { Field } from '../components/Field'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { vehicleSchema, type VehicleInput, type VehicleRecord } from '../lib/schemas'

type VehiclesPageProps = {
	vehicles: VehicleRecord[]
	totalFleet: number
	onAddVehicle: (vehicle: VehicleRecord) => void
	plateQuery: string
	statusFilter: string
	typeFilter: string
}

const createVehicleForm = (): VehicleInput => ({
	plate: '',
	vehicleType: 'Bus',
	driver: '',
	route: '',
	status: 'Active',
	mileage: 0,
	nextService: '',
	utilization: 60,
})

export function VehiclesPage({
	vehicles,
	totalFleet,
	onAddVehicle,
	plateQuery,
	statusFilter,
	typeFilter,
}: VehiclesPageProps) {
	const [form, setForm] = useState<VehicleInput>(createVehicleForm)
	const [errors, setErrors] = useState<Partial<Record<keyof VehicleInput, string>>>({})

	const activeCount = useMemo(
		() => vehicles.filter((vehicle) => vehicle.status === 'Active').length,
		[vehicles]
	)
	const serviceCount = useMemo(
		() => vehicles.filter((vehicle) => vehicle.status === 'Maintenance').length,
		[vehicles]
	)

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		const result = vehicleSchema.safeParse(form)

		if (!result.success) {
			const fieldErrors: Partial<Record<keyof VehicleInput, string>> = {}

			for (const issue of result.error.issues) {
				const field = issue.path[0] as keyof VehicleInput | undefined

				if (field && !fieldErrors[field]) {
					fieldErrors[field] = issue.message
				}
			}

			setErrors(fieldErrors)
			return
		}

		const vehicle: VehicleRecord = {
			...result.data,
			id: `VEH-${Date.now().toString().slice(-5)}`,
		}

		onAddVehicle(vehicle)
		setErrors({})
		setForm(createVehicleForm())
	}

	return (
		<div className="stack">
			<div className="layout-grid layout-grid--stats">
				<StatCard
					label="Total fleet"
					value={String(totalFleet)}
					meta="Registered assets in the registry"
					icon="fleet"
					tone="neutral"
				/>
				<StatCard
					label="Active vehicles"
					value={String(activeCount)}
					meta="Ready for dispatch"
					icon="truck"
					tone="success"
				/>
				<StatCard
					label="Maintenance bay"
					value={String(serviceCount)}
					meta="Vehicles awaiting service"
					icon="wrench"
					tone="warning"
				/>
				<StatCard
					label="Search matches"
					value={String(vehicles.length)}
					meta={
						plateQuery || statusFilter || typeFilter
							? 'Filtered by top bar controls'
							: 'All vehicles visible'
					}
					icon="chart"
					tone="neutral"
				/>
			</div>

			<div className="layout-grid layout-grid--two">
				<SectionCard
					title="Fleet registry"
					subtitle="Current vehicle inventory with status and service windows."
					className="table-card"
				>
					<DataTable
						rows={vehicles}
						columns={[
							{ head: 'Plate', render: (vehicle) => vehicle.plate },
							{ head: 'Type', render: (vehicle) => vehicle.vehicleType },
							{ head: 'Driver', render: (vehicle) => vehicle.driver },
							{
								head: 'Status',
								render: (vehicle) => <StatusBadge status={vehicle.status} />,
							},
							{ head: 'Utilization', render: (vehicle) => `${vehicle.utilization}%` },
							{ head: 'Next service', render: (vehicle) => vehicle.nextService },
						]}
						emptyState="No vehicles match the current filter"
					/>
				</SectionCard>

				<SectionCard
					title="Register vehicle"
					subtitle="Validated by Zod before the asset is added to the fleet."
				>
					<form className="stack" onSubmit={handleSubmit}>
						<div className="field-grid">
							<Field
								label="Plate"
								id="vehicle-plate"
								placeholder="KDA-112A"
								value={form.plate}
								error={errors.plate}
								onChange={(value) =>
									setForm((current) => ({
										...current,
										plate: value.toUpperCase(),
									}))
								}
							/>
							<Field
								label="Vehicle type"
								id="vehicle-type"
								value={form.vehicleType}
								options={[
									{ label: 'Bus', value: 'Bus' },
									{ label: 'Minibus', value: 'Minibus' },
									{ label: 'Truck', value: 'Truck' },
									{ label: 'Van', value: 'Van' },
								]}
								error={errors.vehicleType}
								onChange={(value) =>
									setForm((current) => ({
										...current,
										vehicleType: value as VehicleInput['vehicleType'],
									}))
								}
							/>
							<Field
								label="Driver"
								id="vehicle-driver"
								placeholder="Assigned driver"
								value={form.driver}
								error={errors.driver}
								onChange={(value) =>
									setForm((current) => ({ ...current, driver: value }))
								}
							/>
							<Field
								label="Route"
								id="vehicle-route"
								placeholder="Central loop"
								value={form.route}
								error={errors.route}
								onChange={(value) =>
									setForm((current) => ({ ...current, route: value }))
								}
							/>
							<Field
								label="Mileage"
								id="vehicle-mileage"
								type="number"
								value={String(form.mileage)}
								error={errors.mileage}
								onChange={(value) =>
									setForm((current) => ({ ...current, mileage: Number(value) }))
								}
							/>
							<Field
								label="Next service"
								id="vehicle-next-service"
								type="date"
								value={form.nextService}
								error={errors.nextService}
								onChange={(value) =>
									setForm((current) => ({ ...current, nextService: value }))
								}
							/>
							<Field
								label="Utilization"
								id="vehicle-utilization"
								type="number"
								value={String(form.utilization)}
								error={errors.utilization}
								onChange={(value) =>
									setForm((current) => ({
										...current,
										utilization: Number(value),
									}))
								}
							/>
							<Field
								label="Status"
								id="vehicle-status"
								value={form.status}
								options={[
									{ label: 'Active', value: 'Active' },
									{ label: 'Inspection', value: 'Inspection' },
									{ label: 'Maintenance', value: 'Maintenance' },
								]}
								error={errors.status}
								onChange={(value) =>
									setForm((current) => ({
										...current,
										status: value as VehicleInput['status'],
									}))
								}
							/>
						</div>

						<div className="button-row">
							<button className="button button--primary" type="submit">
								Save vehicle
							</button>
							<button
								className="button button--secondary"
								type="button"
								onClick={() => setForm(createVehicleForm())}
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
