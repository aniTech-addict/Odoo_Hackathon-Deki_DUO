import type { ChangeEvent } from 'react'

type FieldProps = {
	label: string
	id: string
	type?: 'text' | 'number' | 'date' | 'time'
	value: string | number
	placeholder?: string
	error?: string
	options?: Array<{ label: string; value: string }>
	textarea?: boolean
	rows?: number
	onChange: (value: string) => void
}

export function Field({
	label,
	id,
	type = 'text',
	value,
	placeholder,
	error,
	options,
	textarea,
	rows = 4,
	onChange,
}: FieldProps) {
	const handleChange = (
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	) => {
		onChange(event.target.value)
	}

	return (
		<div className="field">
			<label htmlFor={id}>{label}</label>
			{options ? (
				<select id={id} value={value} onChange={handleChange}>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			) : textarea ? (
				<textarea
					id={id}
					placeholder={placeholder}
					rows={rows}
					value={value}
					onChange={handleChange}
				/>
			) : (
				<input
					id={id}
					placeholder={placeholder}
					type={type}
					value={value}
					onChange={handleChange}
				/>
			)}
			<div className="field__error">{error ?? ''}</div>
		</div>
	)
}
