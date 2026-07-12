import { Icon } from './Icon'

type TopBarProps = {
	pageKey: 'dashboard' | 'vehicles' | 'trips' | 'maintenance' | 'expenses' | 'analytics'
	title: string
	description: string
	searchQuery?: string
	searchLabel?: string
	searchPlaceholder?: string
	onSearchChange?: (value: string) => void
	statusFilter?: string
	statusOptions?: Array<{ label: string; value: string }>
	onStatusChange?: (value: string) => void
	typeFilter?: string
	typeOptions?: Array<{ label: string; value: string }>
	onTypeChange?: (value: string) => void
	leftActions?: Array<{ label: string; tone: 'secondary' | 'primary' }>
}

export function TopBar({
	pageKey,
	title,
	description,
	searchQuery,
	searchLabel,
	searchPlaceholder,
	onSearchChange,
	statusFilter,
	statusOptions,
	onStatusChange,
	typeFilter,
	typeOptions,
	onTypeChange,
	leftActions,
}: TopBarProps) {
	const showVehicleFilters = pageKey === 'vehicles'

	return (
		<header className="topbar">
			<div className="topbar__context">
				<div className="topbar__meta">
					<strong>{title}</strong>
					<span>{description}</span>
				</div>
				{leftActions ? (
					<div className="button-row topbar__quick-actions">
						{leftActions.map((action) => (
							<button
								key={action.label}
								className={`button button--${action.tone}`}
								type="button"
							>
								{action.label}
							</button>
						))}
					</div>
				) : null}
			</div>

			<div className="topbar__controls">
				{showVehicleFilters ? (
					<>
						<div className="topbar__search">
							<svg
								aria-hidden="true"
								className="topbar__search-icon"
								fill="none"
								height="20"
								viewBox="0 0 24 24"
								width="20"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="1.8"
							>
								<path d="M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Zm4.8-1.7 3.2 3.2" />
							</svg>
							<input
								aria-label={searchLabel ?? 'Search records'}
								placeholder={searchPlaceholder ?? 'Search'}
								type="search"
								value={searchQuery ?? ''}
								onChange={(event) => onSearchChange?.(event.target.value)}
							/>
						</div>
						<div className="topbar__selects">
							<label className="topbar__select">
								<span>Status</span>
								<select
									value={statusFilter ?? ''}
									onChange={(event) => onStatusChange?.(event.target.value)}
								>
									<option value="">All statuses</option>
									{statusOptions?.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</label>
							<label className="topbar__select">
								<span>Type</span>
								<select
									value={typeFilter ?? ''}
									onChange={(event) => onTypeChange?.(event.target.value)}
								>
									<option value="">All types</option>
									{typeOptions?.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</label>
						</div>
					</>
				) : (
					<div className="topbar__actions">
						<button className="button button--secondary" type="button">
							<Icon name="bell" className="icon-badge" />
							Notifications
						</button>
						<button className="button button--primary" type="button">
							<Icon name="download" className="icon-badge" />
							Export
						</button>
					</div>
				)}
			</div>
		</header>
	)
}
