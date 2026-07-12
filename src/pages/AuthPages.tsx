import { useState, type FormEvent } from 'react'

type LoginPageProps = {
	onSignIn: () => void
	onOpenRecovery: () => void
	onOpenSignUp: () => void
}

type PasswordRecoveryPageProps = {
	onBackToLogin: () => void
}

type SignUpPageProps = {
	onBackToLogin: () => void
}

export function LoginPage({ onSignIn, onOpenRecovery, onOpenSignUp }: LoginPageProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [role, setRole] = useState('Fleet Manager')
	const [rememberSession, setRememberSession] = useState(true)

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!email.trim() || !password.trim()) {
			return
		}

		onSignIn()
	}

	return (
		<main className="auth-shell">
			<section className="auth-panel">
				<div className="auth-panel__brand">
					<div className="auth-panel__brand-mark">TO</div>
					<div>
						<p className="auth-panel__eyebrow">TransitOps</p>
						<h1>Operations Portal</h1>
					</div>
				</div>

				<div className="auth-card">
					<div className="auth-card__header">
						<h2>Secure Sign In</h2>
						<p>
							Use the local sign-in form to enter the fleet workspace. This flow stays
							entirely in the frontend.
						</p>
					</div>

					<form className="auth-form" onSubmit={handleSubmit}>
						<label className="field auth-field">
							<span>Access Role</span>
							<select value={role} onChange={(event) => setRole(event.target.value)}>
								<option value="Fleet Manager">Fleet Manager</option>
								<option value="Driver">Driver</option>
								<option value="Safety Officer">Safety Officer</option>
								<option value="Financial Analyst">Financial Analyst</option>
							</select>
						</label>

						<label className="field auth-field">
							<span>Operator Email</span>
							<input
								autoComplete="email"
								name="email"
								placeholder="name@transitops.com"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
							/>
						</label>

						<label className="field auth-field">
							<div className="auth-field__label-row">
								<span>Security Credential</span>
								<button
									className="auth-link"
									type="button"
									onClick={onOpenRecovery}
								>
									Forgot password?
								</button>
							</div>
							<input
								autoComplete="current-password"
								name="password"
								placeholder="••••••••"
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</label>

						<label className="auth-check">
							<input
								checked={rememberSession}
								type="checkbox"
								onChange={(event) => setRememberSession(event.target.checked)}
							/>
							<span>Maintain active session on this terminal</span>
						</label>

						<button className="button button--primary auth-submit" type="submit">
							Secure Sign In
						</button>

						<button
							className="auth-link auth-link--center"
							type="button"
							onClick={onOpenSignUp}
						>
							Create an account
						</button>
					</form>
				</div>
			</section>
		</main>
	)
}

export function SignUpPage({ onBackToLogin }: SignUpPageProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!email.trim() || !password.trim() || password !== confirmPassword) {
			return
		}

		onBackToLogin()
	}

	return (
		<main className="auth-shell">
			<section className="auth-panel">
				<div className="auth-panel__brand">
					<div className="auth-panel__brand-mark">TO</div>
					<div>
						<p className="auth-panel__eyebrow">TransitOps</p>
						<h1>Sign Up</h1>
					</div>
				</div>

				<div className="auth-card">
					<div className="auth-card__header">
						<h2>Create Account</h2>
						<p>
							Join TransitOps and start managing your fleet operations. This flow
							stays entirely in the frontend for this demo.
						</p>
					</div>

					<form className="auth-form" onSubmit={handleSubmit}>
						<label className="field auth-field">
							<span>Email Address</span>
							<input
								autoComplete="email"
								name="email"
								placeholder="name@transitops.com"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
							/>
						</label>

						<label className="field auth-field">
							<span>Security Credential</span>
							<input
								autoComplete="new-password"
								name="password"
								placeholder="••••••••"
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</label>

						<label className="field auth-field">
							<span>Confirm Security Credential</span>
							<input
								autoComplete="new-password"
								name="confirm-password"
								placeholder="••••••••"
								type="password"
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
							/>
						</label>

						<button className="button button--primary auth-submit" type="submit">
							Create Account
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
						<p>No backend authentication calls are made in this demo.</p>
					</div>
				</div>

				<div className="auth-note">
					<strong>Authorized personnel only.</strong>
					<span>This frontend preview keeps signup interactions self-contained.</span>
				</div>
			</section>
		</main>
	)
}

export function PasswordRecoveryPage({ onBackToLogin }: PasswordRecoveryPageProps) {
	const [email, setEmail] = useState('')
	const [sent, setSent] = useState(false)

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!email.trim()) {
			return
		}

		setSent(true)
	}

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
						<div className="auth-form auth-form--recovery">
							<div className="auth-otp-grid" aria-label="Recovery code inputs">
								{Array.from({ length: 6 }).map((_, index) => (
									<input
										key={index}
										aria-label={`Digit ${index + 1}`}
										maxLength={1}
										type="text"
									/>
								))}
							</div>
							<button className="button button--primary auth-submit" type="button">
								Verify OTP
							</button>
							<button
								className="auth-link auth-link--center"
								type="button"
								onClick={onBackToLogin}
							>
								Change email
							</button>
						</div>
					) : (
						<form className="auth-form" onSubmit={handleSubmit}>
							<label className="field auth-field">
								<span>Email Address</span>
								<input
									autoComplete="email"
									name="recovery-email"
									placeholder="e.g. ops_manager@transitops.com"
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
								/>
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
