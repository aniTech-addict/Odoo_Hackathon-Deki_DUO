import { Icon } from './Icon'
import type { IconName } from './Icon'

type StatCardProps = {
	label: string
	value: string
	meta: string
	icon: IconName
	tone?: 'success' | 'warning' | 'danger' | 'neutral'
}

export function StatCard({ label, value, meta, icon, tone = 'neutral' }: StatCardProps) {
	return (
		<div className="metric-card">
			<div className="section-header" style={{ marginBottom: 0 }}>
				<div>
					<p className="metric-card__label">{label}</p>
					<p className="metric-card__value">{value}</p>
				</div>
				<div className={`chip chip--${tone}`}>
					<Icon name={icon} className="icon-badge" />
				</div>
			</div>
			<p className="metric-card__meta">{meta}</p>
		</div>
	)
}
