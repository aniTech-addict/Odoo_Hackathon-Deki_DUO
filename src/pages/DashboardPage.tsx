import { DataTable } from '../components/DataTable'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import type { ExpenseRecord, MaintenanceRecord, TripRecord, VehicleRecord } from '../lib/schemas'

type DashboardPageProps = {
	overview: {
		fleet: number
		activeVehicles: number
		inService: number
		upcomingTrips: number
	}
	vehicles: VehicleRecord[]
	trips: TripRecord[]
	maintenanceLogs: MaintenanceRecord[]
	expenseLogs: ExpenseRecord[]
}

export function DashboardPage({
	overview,
	vehicles,
	trips,
	maintenanceLogs,
	expenseLogs,
}: DashboardPageProps) {
	return (
		<div className="stack">
			<section className="hero-banner">
				<div className="section-header">
					<div>
						<div className="eyebrow">Transport Operations</div>
						<h2 className="title">Fleet Command Center</h2>
						<p className="subtitle">
							Monitor live fleet activity, dispatch readiness, and maintenance
							pressure from a single control surface.
						</p>
					</div>
					<div className="button-row">
						<button className="button button--secondary" type="button">
							Dispatch view
						</button>
						<button className="button button--primary" type="button">
							New deployment
						</button>
					</div>
				</div>
				<div className="hero-banner__grid">
					<div className="hero-banner__stat">
						<span>Total fleet</span>
						<strong>{overview.fleet}</strong>
					</div>
					<div className="hero-banner__stat">
						<span>Active assets</span>
						<strong>{overview.activeVehicles}</strong>
					</div>
					<div className="hero-banner__stat">
						<span>Trip queue</span>
						<strong>{overview.upcomingTrips}</strong>
					</div>
				</div>
			</section>

			<div className="layout-grid layout-grid--stats">
				<StatCard
					label="Fleet utilization"
					value="82%"
					meta="+4.2% over the last 24h"
					icon="chart"
					tone="success"
				/>
				<StatCard
					label="Live trips"
					value={String(trips.filter((trip) => trip.status !== 'Completed').length)}
					meta="Boarding and in transit"
					icon="route"
					tone="warning"
				/>
				<StatCard
					label="Workshop queue"
					value={String(overview.inService)}
					meta="Vehicles currently in service"
					icon="wrench"
					tone="danger"
				/>
				<StatCard
					label="Fuel spend"
					value="$1.7K"
					meta="Weekly operating expense snapshot"
					icon="wallet"
					tone="neutral"
				/>
			</div>

			<div className="layout-grid layout-grid--two">
				<SectionCard
					title="Vehicle readiness"
					subtitle="Live snapshot of the fleet currently in rotation or service."
					className="table-card"
				>
					<DataTable
						rows={vehicles.slice(0, 4)}
						columns={[
							{ head: 'Plate', render: (vehicle) => vehicle.plate },
							{ head: 'Driver', render: (vehicle) => vehicle.driver },
							{
								head: 'Status',
								render: (vehicle) => <StatusBadge status={vehicle.status} />,
							},
							{ head: 'Next service', render: (vehicle) => vehicle.nextService },
						]}
						emptyState="No vehicles available"
					/>
				</SectionCard>

				<div className="stack">
					<SectionCard
						title="Operational notes"
						subtitle="The control room feed highlights the current pressure points."
					>
						<div className="list">
							{maintenanceLogs.slice(0, 3).map((log) => (
								<div key={log.id} className="list__item">
									<div>
										<strong>{log.title}</strong>
										<p>
											{log.asset} · next review {log.nextCheck}
										</p>
									</div>
									<StatusBadge status={log.status} />
								</div>
							))}
						</div>
					</SectionCard>

					<SectionCard
						title="Cost signal"
						subtitle="Most recent spend entries across fuel and repairs."
					>
						<div className="list">
							{expenseLogs.slice(0, 3).map((entry) => (
								<div key={entry.id} className="list__item">
									<div>
										<strong>{entry.category}</strong>
										<p>
											{entry.asset} · {entry.note}
										</p>
									</div>
									<span className="trend">${entry.amount}</span>
								</div>
							))}
						</div>
					</SectionCard>
				</div>
			</div>
		</div>
	)
}
