export type IconName =
	| 'dashboard'
	| 'fleet'
	| 'route'
	| 'wrench'
	| 'wallet'
	| 'chart'
	| 'search'
	| 'bell'
	| 'download'
	| 'add'
	| 'truck'
	| 'shield'

type IconProps = {
	name: IconName
	className?: string
	label?: string
}

const iconPaths: Record<IconName, string> = {
	dashboard:
		'M4 11.5h6.5V4H4v7.5Zm9.5 8.5H20V10h-6.5V20ZM4 20h6.5v-5.5H4V20Zm9.5-16V8H20V4h-6.5Z',
	fleet: 'M5 16.5V13h14v3.5M7 16.5V19m10-2.5V19M7.5 9.5h9l1 3.5h-11l1-3.5ZM7 6.5h10M6 13.5l-1 2M18 13.5l1 2',
	route: 'M6 7.5a2 2 0 1 1 0 .01Zm12 9a2 2 0 1 1 0 .01Zm-10-1.5h6.5a2 2 0 0 0 2-2V9.5',
	wrench: 'M15.5 5.5a4 4 0 0 0-5.6 5.1L4 16.5 7.5 20l5.9-5.9a4 4 0 0 0 5.1-5.6l-2.1 2.1-2.8-.4-.4-2.8 2.1-2.1Z',
	wallet: 'M5 7h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm12 4h2v4h-2a2 2 0 0 1 0-4Z',
	chart: 'M5 19V5m0 14h14M8 16V11m4 5V8m4 8v-6',
	search: 'M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Zm4.8-1.7 3.2 3.2',
	bell: 'M12 20a2.2 2.2 0 0 0 2.1-1.5H9.9A2.2 2.2 0 0 0 12 20Zm5-5.5V11a5 5 0 0 0-10 0v3.5L5.5 16v1h13v-1l-1.5-1.5Z',
	download: 'M12 4v9m0 0 3.5-3.5M12 13l-3.5-3.5M5 17.5h14',
	add: 'M12 5v14M5 12h14',
	truck: 'M4.5 7.5h10v8h-10zM14.5 10h3l2 2.5v3.5h-5zM7 18.5a1.5 1.5 0 1 1 0 .01Zm9 0a1.5 1.5 0 1 1 0 .01Z',
	shield: 'M12 4.5 18 7v5.5c0 4.2-2.6 7.1-6 8-3.4-.9-6-3.8-6-8V7l6-2.5Z',
}

export function Icon({ name, className, label }: IconProps) {
	return (
		<svg
			aria-hidden={label ? undefined : 'true'}
			aria-label={label}
			className={className}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.7"
			viewBox="0 0 24 24"
		>
			<path d={iconPaths[name]} />
		</svg>
	)
}
