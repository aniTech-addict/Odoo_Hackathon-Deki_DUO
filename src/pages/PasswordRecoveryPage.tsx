import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const recoveryEmailSchema = z.object({
	email: z.string().email('Enter a valid email address'),
})

type RecoveryEmailInput = z.infer<typeof recoveryEmailSchema>

const otpSchema = z.object({
	otp: z.string().length(6, 'Enter a 6-digit code').regex(/^\d+$/, 'Must be digits only'),
})

type OtpInput = z.infer<typeof otpSchema>

type PasswordRecoveryPageProps = {
	onBackToLogin: () => void
}

export function PasswordRecoveryPage({ onBackToLogin }: PasswordRecoveryPageProps) {
	const [sent, setSent] = useState(false)

	const {
		register: registerEmail,
		handleSubmit: handleSubmitEmail,
		formState: { errors: emailErrors },
	} = useForm<RecoveryEmailInput>({
		resolver: zodResolver(recoveryEmailSchema),
		defaultValues: { email: '' },
	})

	const {
		handleSubmit: handleSubmitOtp,
		formState: { errors: otpErrors },
		setValue: setOtpValue,
		watch: watchOtp,
	} = useForm<OtpInput>({
		resolver: zodResolver(otpSchema),
		defaultValues: { otp: '' },
	})

	const handleEmailSubmit = () => {
		setSent(true)
	}

	const handleOtpSubmit = () => {
		onBackToLogin()
	}

	const otpValue = watchOtp('otp') || ''

	return (
		<main className="auth-shell auth-shell--recovery">
			<section className="auth-panel auth-panel--recovery">
				<div className="auth-panel__brand">
					<div className="auth-panel__brand-mark">TO</div>
					<div>
						<p className="auth-panel__eyebrow">TransitOps</p>
						<h1>Password Recovery</h1>
					</div>
				</div>

				<div className="auth-card">
					<div className="auth-card__header">
						<h2>{sent ? 'Verify Identity' : 'Forgot Password'}</h2>
						<p>
							{sent
								? 'Enter the local verification code sent to your registered TransitOps email.'
								: 'Enter your registered email address to receive a local recovery code.'}
						</p>
					</div>

					{sent ? (
						<form className="auth-form auth-form--recovery" onSubmit={handleSubmitOtp(handleOtpSubmit)}>
							<div className="auth-otp-grid" aria-label="Recovery code inputs">
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
											setOtpValue('otp', nextOtp, { shouldValidate: true })

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
							{otpErrors.otp && (
								<div className="field__error" style={{ textAlign: 'center' }}>
									{otpErrors.otp.message}
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
								Change email
							</button>
						</form>
					) : (
						<form className="auth-form" onSubmit={handleSubmitEmail(handleEmailSubmit)}>
							<label className="field auth-field">
								<span>Email Address</span>
								<input
									autoComplete="email"
									placeholder="e.g. ops_manager@transitops.com"
									type="email"
									{...registerEmail('email')}
								/>
								{emailErrors.email && <div className="field__error">{emailErrors.email.message}</div>}
							</label>
							<button className="button button--primary auth-submit" type="submit">
								Get OTP
							</button>
							<button
								className="auth-link auth-link--center"
								type="button"
								onClick={onBackToLogin}
							>
								Back to login
							</button>
						</form>
					)}
				</div>

				<div className="auth-note">
					<strong>Security notice.</strong>
					<span>Recovery codes are simulated locally and never sent to a backend.</span>
				</div>
			</section>
		</main>
	)
}
