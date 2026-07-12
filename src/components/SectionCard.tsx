import type { ReactNode } from 'react'

type SectionCardProps = {
	title: string
	subtitle?: string
	action?: ReactNode
	children: ReactNode
	className?: string
}

export function SectionCard({ title, subtitle, action, children, className }: SectionCardProps) {
	return (
		<section className={`card ${className ?? ''}`}>
			<div className="card__header">
				<div>
					<h3 className="card__title">{title}</h3>
					{subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
				</div>
				{action}
			</div>
			<div className="card__body">{children}</div>
		</section>
	)
}
