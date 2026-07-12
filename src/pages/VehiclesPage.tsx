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
	onAddVehicle: (vehicle: VehicleInput) => void
	registrationQuery: string
	statusFilter: string
	typeFilter: string
}

const createVehicleForm = (): VehicleInput => ({
	registrationNumber: '',
	model: '',
	type: ['Bus'],
	capacity: { amount: 0, unit: 'kg' },
	odometer: 0,
	acquirementCost: { amount: 0, currency: 'rupees' },
	status: 'available',
})

export function VehiclesPage({
	vehicles,
	totalFleet,
	onAddVehicle,
	registrationQuery,
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
		() => vehicles.filter((vehicle) => vehicle.status === 'available').length,
		[vehicles]
	)
	const serviceCount = useMemo(
		() => vehicles.filter((vehicle) => vehicle.status === 'in shop').length,
		[vehicles]
	)

	const onSubmit = (data: VehicleInput) => {
		// Type field in form is a string if it's a simple select, but schema expects an array.
		// If we use a simple select, we need to ensure it's an array.
		const payload = {
			...data,
			type: Array.isArray(data.type) ? data.type : [data.type],
		}
		onAddVehicle(payload)
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
					label="Available vehicles"
					value={String(activeCount)}
					meta="Ready for dispatch"
					icon="truck"
					tone="success"
				/>
				<StatCard
					label="In shop"
					value={String(serviceCount)}
					meta="Vehicles awaiting service"
					icon="wrench"
					tone="warning"
				/>
				<StatCard
					label="Search matches"
					value={String(vehicles.length)}
					meta={
						registrationQuery || statusFilter || typeFilter
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
					subtitle="Current vehicle inventory with status and details."
					className="table-card"
				>
					<DataTable
						rows={vehicles}
						columns={[
							{ head: 'Registration', render: (vehicle) => vehicle.registrationNumber },
							{ head: 'Model', render: (vehicle) => vehicle.model },
							{ head: 'Type', render: (vehicle) => vehicle.type.join(', ') },
							{
								head: 'Status',
								render: (vehicle) => <StatusBadge status={vehicle.status} />,
							},
							{ head: 'Odometer', render: (vehicle) => String(vehicle.odometer) },
							{ head: 'Capacity', render: (vehicle) => `${vehicle.capacity.amount} ${vehicle.capacity.unit}` },
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
								name="registrationNumber"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Registration Number"
										id="vehicle-reg"
										placeholder="KDA-112A"
										value={value}
										error={error?.message}
										onChange={(val) => onChange(val.toUpperCase())}
									/>
								)}
							/>
							<Controller
								control={control}
								name="model"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Model"
										id="vehicle-model"
										placeholder="Toyota Hiace"
										value={value}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name="type"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Vehicle type"
										id="vehicle-type"
										value={Array.isArray(value) ? value[0] : value}
										options={[
											{ label: 'Bus', value: 'Bus' },
											{ label: 'Minibus', value: 'Minibus' },
											{ label: 'Truck', value: 'Truck' },
											{ label: 'Van', value: 'Van' },
										]}
										error={error?.message}
										onChange={(val) => onChange([val])}
									/>
								)}
							/>
							<Controller
								control={control}
								name="odometer"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Odometer"
										id="vehicle-odometer"
										type="number"
										value={value}
										error={error?.message}
										onChange={(val) => onChange(Number(val))}
									/>
								)}
							/>
							<Controller
								control={control}
								name="capacity.amount"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Capacity Amount"
										id="vehicle-capacity-amount"
										type="number"
										value={value}
										error={error?.message}
										onChange={(val) => onChange(Number(val))}
									/>
								)}
							/>
							<Controller
								control={control}
								name="capacity.unit"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Capacity Unit"
										id="vehicle-capacity-unit"
										value={value}
										options={[
											{ label: 'kg', value: 'kg' },
											{ label: 'ton', value: 'ton' },
										]}
										error={error?.message}
										onChange={onChange}
									/>
								)}
							/>
							<Controller
								control={control}
								name="acquirementCost.amount"
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<Field
										label="Acquirement Cost"
										id="vehicle-cost"
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
											{ label: 'available', value: 'available' },
											{ label: 'on trip', value: 'on trip' },
											{ label: 'in shop', value: 'in shop' },
											{ label: 'retired', value: 'retired' },
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
