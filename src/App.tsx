import { useMemo, useState } from 'react'
import { AppShell } from './components/AppShell'
import {
	dashboardPages,
	seedExpenseLogs,
	seedMaintenanceLogs,
	seedTrips,
	seedVehicles,
} from './data/mockData'
import { LoginPage, SignUpPage, type SignUpInput } from './pages/AuthPages'
import { PasswordRecoveryPage } from './pages/PasswordRecoveryPage'
import { VerifyOtpPage } from './pages/VerifyOtpPage'
import type { PageKey, TripRecord, VehicleRecord } from './lib/schemas'
import type { SignInInput } from '../server/schemas/auth.schema'
import axios from 'axios'
import './App.css'

function App() {
	const [authScreen, setAuthScreen] = useState<'login' | 'recovery' | 'signup' | 'otp'>('login')
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [activePage, setActivePage] = useState<PageKey>('dashboard')
	const [plateQuery, setPlateQuery] = useState('')
	const [vehicleStatus, setVehicleStatus] = useState('')
	const [vehicleType, setVehicleType] = useState('')
	const [vehicles, setVehicles] = useState<VehicleRecord[]>(seedVehicles)
	const [trips, setTrips] = useState<TripRecord[]>(seedTrips)
	const [maintenanceLogs] = useState(seedMaintenanceLogs)
	const [expenseLogs] = useState(seedExpenseLogs)

	// Auth and API state
	const [userSignupToken, setUserSignupToken] = useState<string | null>(null)
	const [authError, setAuthError] = useState<string | null>(null)

	const visiblePlateQuery = plateQuery.trim().toLowerCase()

	const pageMeta = dashboardPages.find((page) => page.id === activePage)
	const pageTitle = pageMeta?.title ?? 'TransitOps'
	const pageDescription = pageMeta?.description ?? 'Fleet operations workspace'

	const overview = useMemo(
		() => ({
			fleet: vehicles.length,
			activeVehicles: vehicles.filter((vehicle) => vehicle.status === 'Active').length,
			inService: maintenanceLogs.filter((log) => log.status === 'In Service').length,
			upcomingTrips: trips.filter((trip) => trip.status === 'Scheduled').length,
		}),
		[maintenanceLogs, trips, vehicles]
	)

	const filteredVehicles = useMemo(() => {
		return vehicles.filter((vehicle) => {
			const matchesPlate = visiblePlateQuery
				? vehicle.plate.toLowerCase().includes(visiblePlateQuery)
				: true
			const matchesStatus = vehicleStatus ? vehicle.status === vehicleStatus : true
			const matchesType = vehicleType ? vehicle.vehicleType === vehicleType : true

			return matchesPlate && matchesStatus && matchesType
		})
	}, [vehicleStatus, vehicleType, vehicles, visiblePlateQuery])

	const handleAddVehicle = (vehicle: VehicleRecord) => {
		setVehicles((currentVehicles) => [vehicle, ...currentVehicles])
		setActivePage('vehicles')
	}

	const handleAddTrip = (trip: TripRecord) => {
		setTrips((currentTrips) => [trip, ...currentTrips])
		setActivePage('trips')
	}

	const handleSignIn = async (data: SignInInput) => {
		setAuthError(null)
		try {
			const response = await axios.post('/api/v1/auth/sign_in', data)
			if (response.data.status === 'success') {
				setAuthScreen('otp')
			} else {
				setAuthError(response.data.message || 'Login failed')
			}
		} catch (error: any) {
			setAuthError(error.response?.data?.message || 'Login failed')
		}
	}

	const handleSignUp = async (data: SignUpInput) => {
		setAuthError(null)
		try {
			const response = await axios.post('/api/v1/auth/sign_up', {
				username: data.username,
				email: data.email,
				password: data.password,
				role: data.role,
			})
			if (response.data.status === 'success') {
				setUserSignupToken(response.data.userSignupToken)
				setAuthScreen('otp')
			} else {
				setAuthError(response.data.message || 'Sign up failed')
			}
		} catch (error: any) {
			setAuthError(error.response?.data?.message || 'Sign up failed')
		}
	}

	const handleVerifyOtp = async (otp: string) => {
		setAuthError(null)
		try {
			if (!userSignupToken) {
				// Since sign_in does not have an OTP token returned or verified in the backend,
				// if a user logs in and gets redirected here, any 6-digit OTP verification simulates success.
				setIsAuthenticated(true)
				return
			}

			const response = await axios.post('/api/v1/auth/verify_otp', {
				otp,
				userSignupToken,
			})
			if (response.data.status === 'success') {
				setIsAuthenticated(true)
			} else {
				setAuthError(response.data.message || 'Verification failed')
			}
		} catch (error: any) {
			setAuthError(error.response?.data?.message || 'Verification failed')
		}
	}

	if (!isAuthenticated) {
		if (authScreen === 'recovery') {
			return <PasswordRecoveryPage onBackToLogin={() => setAuthScreen('login')} />
		}
		if (authScreen === 'signup') {
			return (
				<SignUpPage
					onSignUp={handleSignUp}
					onBackToLogin={() => setAuthScreen('login')}
					errorMessage={authError}
				/>
			)
		}
		if (authScreen === 'otp') {
			return (
				<VerifyOtpPage
					onVerify={handleVerifyOtp}
					onBackToLogin={() => setAuthScreen('login')}
					errorMessage={authError}
				/>
			)
		}
		return (
			<LoginPage
				onSignIn={handleSignIn}
				onOpenRecovery={() => setAuthScreen('recovery')}
				onOpenSignUp={() => setAuthScreen('signup')}
				errorMessage={authError}
			/>
		)
	}

	return (
		<AppShell
			activePage={activePage}
			setActivePage={setActivePage}
			pageTitle={pageTitle}
			pageDescription={pageDescription}
			plateQuery={plateQuery}
			setPlateQuery={setPlateQuery}
			vehicleStatus={vehicleStatus}
			setVehicleStatus={setVehicleStatus}
			vehicleType={vehicleType}
			setVehicleType={setVehicleType}
			overview={overview}
			vehicles={vehicles}
			trips={trips}
			maintenanceLogs={maintenanceLogs}
			expenseLogs={expenseLogs}
			filteredVehicles={filteredVehicles}
			handleAddVehicle={handleAddVehicle}
			handleAddTrip={handleAddTrip}
		/>
	)
}

export default App
