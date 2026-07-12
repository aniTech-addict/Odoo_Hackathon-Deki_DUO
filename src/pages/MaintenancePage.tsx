import { DataTable } from '../components/DataTable'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import type { MaintenanceRecord, VehicleRecord } from '../lib/schemas'

type MaintenancePageProps = {
	maintenanceLogs: MaintenanceRecord[]
	vehicles: VehicleRecord[]
}

export function MaintenancePage({ maintenanceLogs, vehicles }: MaintenancePageProps) {
	return (
		<div className="stack">
			<div className="layout-grid layout-grid--stats">
				<StatCard
					label="Work orders"
					value={String(maintenanceLogs.length)}
					meta="Open and closed service requests"
					icon="wrench"
					tone="warning"
				/>
				<StatCard
					label="In service"
					value={String(
						maintenanceLogs.filter((log) => log.status === 'In Service').length
					)}
					meta="Vehicles currently in the workshop"
					icon="truck"
					tone="danger"
				/>
				<StatCard
					label="Ready fleet"
					value={String(vehicles.filter((vehicle) => vehicle.status === 'available').length)}
					meta="Vehicles available for dispatch"
					icon="fleet"
					tone="success"
				/>
				<StatCard
					label="Avg. turnaround"
					value="4.2d"
					meta="Maintenance cycle average"
					icon="chart"
					tone="neutral"
				/>
			</div>

			<div className="layout-grid layout-grid--two">
				<SectionCard
					title="Maintenance log"
					subtitle="Service events and follow-up checks for the fleet."
					className="table-card"
				>
					<DataTable
						rows={maintenanceLogs}
						columns={[
							{ head: 'Task', render: (log) => log.title },
							{ head: 'Asset', render: (log) => log.asset },
							{
								head: 'Status',
								render: (log) => <StatusBadge status={log.status} />,
							},
							{ head: 'Cost', render: (log) => `$${log.cost}` },
							{ head: 'Next check', render: (log) => log.nextCheck },
						]}
						emptyState="No maintenance entries available"
					/>
				</SectionCard>

				<SectionCard
					title="Maintenance priorities"
					subtitle="The next service cycle should focus on the following assets."
				>
					<div className="list">
						{maintenanceLogs.map((log) => (
							<div key={log._id} className="list__item">
								<div>
									<strong>{log.asset}</strong>
									<p>{log.title}</p>
								</div>
								<StatusBadge status={log.status} />
							</div>
						))}
					</div>
				</SectionCard>
			</div>
		</div>
	)
}
