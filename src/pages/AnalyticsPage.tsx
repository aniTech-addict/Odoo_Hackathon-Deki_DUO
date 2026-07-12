import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import type { MaintenanceRecord, TripRecord, VehicleRecord } from '../lib/schemas'

type AnalyticsPageProps = {
	vehicles: VehicleRecord[]
	trips: TripRecord[]
	maintenanceLogs: MaintenanceRecord[]
}

export function AnalyticsPage({ vehicles, trips, maintenanceLogs }: AnalyticsPageProps) {
	const utilization = Math.round(
		vehicles.reduce((sum, vehicle) => sum + vehicle.utilization, 0) /
			Math.max(vehicles.length, 1)
	)
	const serviceLoad = maintenanceLogs.filter((log) => log.status !== 'Complete').length
	const completedTrips = trips.filter((trip) => trip.status === 'Completed').length

	return (
		<div className="stack">
			<div className="layout-grid layout-grid--stats">
				<StatCard
					label="Fleet utilization"
					value={`${utilization}%`}
					meta="Weighted by the current vehicle mix"
					icon="chart"
					tone="success"
				/>
				<StatCard
					label="Completed trips"
					value={String(completedTrips)}
					meta="Trips closed out in the board"
					icon="route"
					tone="neutral"
				/>
				<StatCard
					label="Service load"
					value={String(serviceLoad)}
					meta="Open items needing maintenance"
					icon="wrench"
					tone="warning"
				/>
				<StatCard
					label="Availability"
					value={`${Math.max(100 - serviceLoad * 8, 0)}%`}
					meta="Indicative fleet availability"
					icon="fleet"
					tone="success"
				/>
			</div>

			<div className="layout-grid layout-grid--two">
				<SectionCard
					title="Performance summary"
					subtitle="A compact operational pulse for leadership and dispatch."
				>
					<div className="list">
						<div className="list__item">
							<div>
								<strong>Utilization trend</strong>
								<p>Fleet usage is holding above target for the week.</p>
							</div>
							<span className="trend">+4.2%</span>
						</div>
						<div className="list__item">
							<div>
								<strong>Dispatch reliability</strong>
								<p>Most trips are boarding on schedule with minimal drift.</p>
							</div>
							<span className="chip chip--success">Stable</span>
						</div>
						<div className="list__item">
							<div>
								<strong>Workshop pressure</strong>
								<p>Service queue is concentrated on two high-mileage units.</p>
							</div>
							<span className="chip chip--warning">Watch list</span>
						</div>
					</div>
				</SectionCard>

				<SectionCard
					title="Trend snapshot"
					subtitle="Use these indicators to guide dispatch and maintenance planning."
				>
					<div className="stack stack--tight">
						<div className="hero-banner__stat">
							<span>Fleet health</span>
							<strong>
								{vehicles.filter((vehicle) => vehicle.status === 'Active').length}{' '}
								active units
							</strong>
						</div>
						<div className="hero-banner__stat">
							<span>Trip throughput</span>
							<strong>{completedTrips} completed routes</strong>
						</div>
						<div className="hero-banner__stat">
							<span>Maintenance priority</span>
							<strong>{serviceLoad} open work items</strong>
						</div>
					</div>
				</SectionCard>
			</div>
		</div>
	)
}
