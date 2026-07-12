type StatusBadgeProps = {
	status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
	const lower = status.toLowerCase()
	const tone =
		lower.includes('active') || lower.includes('complete') || lower.includes('transit')
			? 'success'
			: lower.includes('maint') || lower.includes('scheduled')
				? 'warning'
				: lower.includes('delay')
					? 'danger'
					: 'neutral'

	return <span className={`chip chip--${tone}`}>{status}</span>
}
