import { navigationItems } from '../data/mockData'
import type { PageKey } from '../lib/schemas'
import { Icon } from './Icon'
import type { IconName } from './Icon'

type SidebarProps = {
	activePage: PageKey
	onNavigate: (page: PageKey) => void
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
	return (
		<aside className="sidebar">
			<div className="sidebar__brand">
				<h1>TransitOps</h1>
				<p>Fleet Manager</p>
			</div>

			<nav className="sidebar__nav" aria-label="Primary">
				{navigationItems.map((item) => (
					<button
						key={item.id}
						className={`sidebar__item ${activePage === item.id ? 'sidebar__item--active' : ''}`}
						type="button"
						onClick={() => onNavigate(item.id)}
					>
						<Icon name={item.icon as IconName} className="icon-badge" />
						<span className="sidebar__item-label">{item.label}</span>
					</button>
				))}
			</nav>

			<div className="sidebar__footer">
				<button
					className="sidebar__item"
					type="button"
					onClick={() => onNavigate('analytics')}
				>
					<Icon name="shield" className="icon-badge" />
					<span className="sidebar__item-label">Security & settings</span>
				</button>

				<div className="sidebar__profile">
					<div className="sidebar__avatar" />
					<div>
						<strong>SANJU KUMAR</strong>
						<span>Operations Chief</span>
					</div>
				</div>
			</div>
		</aside>
	)
}
