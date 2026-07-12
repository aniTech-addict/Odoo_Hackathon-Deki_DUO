import { DataTable } from '../components/DataTable'
import { SectionCard } from '../components/SectionCard'
import { StatCard } from '../components/StatCard'
import type { ExpenseRecord, MaintenanceRecord } from '../lib/schemas'

type ExpensesPageProps = {
	expenseLogs: ExpenseRecord[]
	maintenanceLogs: MaintenanceRecord[]
}

export function ExpensesPage({ expenseLogs, maintenanceLogs }: ExpensesPageProps) {
	const totalSpend = expenseLogs.reduce((sum, entry) => sum + entry.amount, 0)
	const fuelSpend = expenseLogs
		.filter((entry) => entry.category === 'Fuel')
		.reduce((sum, entry) => sum + entry.amount, 0)

	return (
		<div className="stack">
			<div className="layout-grid layout-grid--stats">
				<StatCard
					label="Total spend"
					value={`$${totalSpend.toLocaleString()}`}
					meta="Latest operational expenditure total"
					icon="wallet"
					tone="neutral"
				/>
				<StatCard
					label="Fuel spend"
					value={`$${fuelSpend.toLocaleString()}`}
					meta="Tracked from active refuel logs"
					icon="truck"
					tone="warning"
				/>
				<StatCard
					label="Maintenance cost"
					value={`$${maintenanceLogs.reduce((sum, entry) => sum + entry.cost, 0).toLocaleString()}`}
					meta="Service work and parts"
					icon="wrench"
					tone="danger"
				/>
				<StatCard
					label="Cost entries"
					value={String(expenseLogs.length)}
					meta="Expense rows recorded"
					icon="chart"
					tone="success"
				/>
			</div>

			<SectionCard
				title="Expense ledger"
				subtitle="Fuel, repairs, and parts recorded against fleet assets."
				className="table-card"
			>
				<DataTable
					rows={expenseLogs}
					columns={[
						{ head: 'Category', render: (entry) => entry.category },
						{ head: 'Asset', render: (entry) => entry.asset },
						{ head: 'Date', render: (entry) => entry.date },
						{ head: 'Note', render: (entry) => entry.note },
						{ head: 'Amount', render: (entry) => `$${entry.amount}` },
					]}
					emptyState="No expense records available"
				/>
			</SectionCard>
		</div>
	)
}
