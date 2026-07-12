import type { ReactNode } from 'react'

type Column<Row> = {
	head: string
	render: (row: Row) => ReactNode
}

type DataTableProps<Row> = {
	columns: Column<Row>[]
	rows: Row[]
	emptyState: string
}

export function DataTable<Row>({ columns, rows, emptyState }: DataTableProps<Row>) {
	return (
		<div className="table-card surface-card">
			<div className="table-wrap">
				<table>
					<thead>
						<tr>
							{columns.map((column) => (
								<th key={column.head}>{column.head}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.length === 0 ? (
							<tr>
								<td colSpan={columns.length}>{emptyState}</td>
							</tr>
						) : (
							rows.map((row, rowIndex) => (
								<tr key={rowIndex}>
									{columns.map((column) => (
										<td key={column.head}>{column.render(row)}</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
