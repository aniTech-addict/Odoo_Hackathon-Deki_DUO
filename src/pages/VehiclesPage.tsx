import { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
	const {
		control,
		handleSubmit,
		reset,
	} = useForm<VehicleInput>({
		resolver: zodResolver(vehicleSchema),
		defaultValues: createVehicleForm(),
	})

	const activeCount = useMemo(
		() => vehicles.filter((vehicle) => vehicle.status === 'Active').length,
		[vehicles]
	)
	const serviceCount = useMemo(
		() => vehicles.filter((vehicle) => vehicle.status === 'Maintenance').length,
		[vehicles]
	)

	const onSubmit = (data: VehicleInput) => {
		const vehicle: VehicleRecord = {
			...data,
			id: `VEH-${Date.now().toString().slice(-5)}`,
		}

		onAddVehicle(vehicle)
		reset(createVehicleForm())
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
					<form className="stack" onSubmit={handleSubmit(onSubmit)}>
						<div className="field-grid">
							<Controller
								control={control}
								name="plate"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Plate"
										id="vehicle-plate"
										placeholder="KDA-112A"
										value={value}
										error={error?.message}
										onChange={(val) => onChange(val.toUpperCase())}
									/>
								)}
							/>
							<Controller
								control={control}
								name="vehicleType"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Vehicle type"
										id="vehicle-type"
										value={value}
										options={[
											{ label: 'Bus', value: 'Bus' },
											{ label: 'Minibus', value: 'Minibus' },
											{ label: 'Truck', value: 'Truck' },
											{ label: 'Van', value: 'Van' },
										]}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name="driver"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Driver"
										id="vehicle-driver"
										placeholder="Assigned driver"
										value={value}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name="route"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Route"
										id="vehicle-route"
										placeholder="Central loop"
										value={value}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name="mileage"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Mileage"
										id="vehicle-mileage"
										type="number"
										value={value}
										error={error?.message}
										onChange={(val) => onChange(Number(val))}
									/>
								)}
							/>
							<Controller
								control={control}
								name="nextService"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Next service"
										id="vehicle-next-service"
										type="date"
										value={value}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name="utilization"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Utilization"
										id="vehicle-utilization"
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
										id="vehicle-status"
										value={value}
										options={[
											{ label: 'Active', value: 'Active' },
											{ label: 'Inspection', value: 'Inspection' },
											{ label: 'Maintenance', value: 'Maintenance' },
										]}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
						</div>

						<div className="button-row">
							<button className="button button--primary" type="submit">
								Save vehicle
							</button>
							<button
								className="button button--secondary"
								type="button"
								onClick={() => reset(createVehicleForm())}
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
