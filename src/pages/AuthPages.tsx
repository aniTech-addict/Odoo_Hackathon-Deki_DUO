import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
	authCredentialsSchema,
	signUpSchema,
	type SignInInput,
} from '../../server/schemas/auth.schema'

type LoginPageProps = {
	onSignIn: (data: SignInInput) => void
	onOpenRecovery: () => void
	onOpenSignUp: () => void
	errorMessage?: string | null
}


type SignUpPageProps = {
	onSignUp: (data: SignUpInput) => void
	onBackToLogin: () => void
	errorMessage?: string | null
}

export function LoginPage({ onSignIn, onOpenRecovery, onOpenSignUp, errorMessage }: LoginPageProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInInput>({
		resolver: zodResolver(authCredentialsSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	})

	const onSubmit = (data: SignInInput) => {
		onSignIn(data)
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

					<form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
						<label className="field auth-field">
							<span>Operator Username</span>
							<input
								placeholder="Username"
								type="text"
								{...register('username')}
							/>
							{errors.username && <div className="field__error">{errors.username.message}</div>}
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
								placeholder="••••••••"
								type="password"
								{...register('password')}
							/>
							{errors.password && <div className="field__error">{errors.password.message}</div>}
						</label>

						{errorMessage && (
							<div className="field__error" style={{ textAlign: 'center', marginBottom: '1rem' }}>
								{errorMessage}
							</div>
						)}

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

const frontendSignUpSchema = signUpSchema
	.extend({
		confirmPassword: z.string().min(1, 'Please confirm your password'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	})

export type SignUpInput = z.infer<typeof frontendSignUpSchema>

export function SignUpPage({ onSignUp, onBackToLogin, errorMessage }: SignUpPageProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpInput>({
		resolver: zodResolver(frontendSignUpSchema),
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
			role: 'Fleet Manager',
		},
	})

	const onSubmit = (data: SignUpInput) => {
		onSignUp(data)
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

					<form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
						<label className="field auth-field">
							<span>Username</span>
							<input
								placeholder="Username"
								type="text"
								{...register('username')}
							/>
							{errors.username && <div className="field__error">{errors.username.message}</div>}
						</label>

						<label className="field auth-field">
							<span>Email Address</span>
							<input
								autoComplete="email"
								placeholder="name@transitops.com"
								type="email"
								{...register('email')}
							/>
							{errors.email && <div className="field__error">{errors.email.message}</div>}
						</label>

						<label className="field auth-field">
							<span>Access Role</span>
							<select {...register('role')}>
								<option value="Fleet Manager">Fleet Manager</option>
								<option value="Dispatcher">Dispatcher</option>
								<option value="Safety Officer">Safety Officer</option>
								<option value="Financial Analyst">Financial Analyst</option>
							</select>
							{errors.role && <div className="field__error">{errors.role.message}</div>}
						</label>

						<label className="field auth-field">
							<span>Security Credential</span>
							<input
								autoComplete="new-password"
								placeholder="••••••••"
								type="password"
								{...register('password')}
							/>
							{errors.password && <div className="field__error">{errors.password.message}</div>}
						</label>

						<label className="field auth-field">
							<span>Confirm Security Credential</span>
							<input
								autoComplete="new-password"
								placeholder="••••••••"
								type="password"
								{...register('confirmPassword')}
							/>
							{errors.confirmPassword && (
								<div className="field__error">{errors.confirmPassword.message}</div>
							)}
						</label>

						{errorMessage && (
							<div className="field__error" style={{ textAlign: 'center', marginBottom: '1rem' }}>
								{errorMessage}
							</div>
						)}

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
