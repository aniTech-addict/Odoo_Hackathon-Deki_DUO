import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const otpSchema = z.object({
	otp: z.string().length(6, 'Enter a 6-digit code').regex(/^\d+$/, 'Must be digits only'),
})

type OtpInput = z.infer<typeof otpSchema>

type VerifyOtpPageProps = {
	onVerify: (otp: string) => void
	onBackToLogin: () => void
	errorMessage?: string | null
}

export function VerifyOtpPage({ onVerify, onBackToLogin, errorMessage }: VerifyOtpPageProps) {
	const {
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<OtpInput>({
		resolver: zodResolver(otpSchema),
		defaultValues: { otp: '' },
	})

	const onSubmit = (data: OtpInput) => {
		onVerify(data.otp)
	}

	const otpValue = watch('otp') || ''

	return (
		<main className="auth-shell">
			<section className="auth-panel">
				<div className="auth-panel__brand">
					<div className="auth-panel__brand-mark">TO</div>
					<div>
						<p className="auth-panel__eyebrow">TransitOps</p>
						<h1>Verify Identity</h1>
					</div>
				</div>

				<div className="auth-card">
					<div className="auth-card__header">
						<h2>Enter OTP Code</h2>
						<p>Enter the 6-digit verification code sent to your email.</p>
					</div>

					<form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
						<div className="auth-otp-grid" aria-label="OTP verification inputs">
							{Array.from({ length: 6 }).map((_, index) => (
								<input
									key={index}
									aria-label={`Digit ${index + 1}`}
									maxLength={1}
									type="text"
									value={otpValue[index] || ''}
									onChange={(e) => {
										const val = e.target.value
										const currentOtp = otpValue.split('')
										currentOtp[index] = val.slice(-1)
										const nextOtp = currentOtp.join('')
										setValue('otp', nextOtp, { shouldValidate: true })

										if (val && e.target.nextElementSibling) {
											;(e.target.nextElementSibling as HTMLInputElement).focus()
										}
									}}
									onKeyDown={(e) => {
										if (e.key === 'Backspace' && !otpValue[index] && e.currentTarget.previousElementSibling) {
											;(e.currentTarget.previousElementSibling as HTMLInputElement).focus()
										}
									}}
								/>
							))}
						</div>
						{errors.otp && (
							<div className="field__error" style={{ textAlign: 'center' }}>
								{errors.otp.message}
							</div>
						)}
						{errorMessage && (
							<div className="field__error" style={{ textAlign: 'center' }}>
								{errorMessage}
							</div>
						)}

						<button className="button button--primary auth-submit" type="submit">
							Verify OTP
						</button>
						<button
							className="auth-link auth-link--center"
							type="button"
							onClick={onBackToLogin}
						>
							Back to login
						</button>
					</form>

					<div className="auth-card__footer">
						<p>Redirection and database registration happens upon successful OTP verification.</p>
					</div>
				</div>

				<div className="auth-note">
					<strong>Authorized personnel only.</strong>
					<span>Check your system console or local mail dev tools for the verification code.</span>
				</div>
			</section>
		</main>
	)
}
