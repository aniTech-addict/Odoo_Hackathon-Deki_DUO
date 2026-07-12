import express from 'express'

//Config
import { PORT } from './configs/env.js'
import cookieParser from 'cookie-parser'
import connectDb from './db/connectDb.js'

//Authorization
import authRouter from './routes/auth.route.js'
import vehicleRouter from './routes/vehicle.route.js'
import driverRouter from './routes/driver.route.js'
import tripRouter from './routes/trip.route.js'
import expenseRouter from './routes/expense.route.js'
import maintenanceRouter from './routes/maintenance.route.js'
import authorizationMiddleware from './middlewares/authorizeUser.middleware.js'
import { authorizeAdmin } from './middlewares/authorizeAdmin.middleware.js'

const app = express()
await connectDb()

app.use(express.json())
app.use(cookieParser())

// Serve uploaded files
app.use('/uploads', express.static('uploads'))

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/vehicles', authorizationMiddleware, vehicleRouter)
app.use('/api/v1/drivers', authorizationMiddleware, driverRouter)
app.use('/api/v1/trips', authorizationMiddleware, tripRouter)
app.use('/api/v1/expenses', authorizationMiddleware, expenseRouter)
app.use('/api/v1/maintenance', authorizationMiddleware, maintenanceRouter)
app.use('/api/v1/profile', authorizationMiddleware, authorizeAdmin, (req, res) => {
	res.status(200).json({ message: 'Authorized' })
})
app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`)
})

export default app
