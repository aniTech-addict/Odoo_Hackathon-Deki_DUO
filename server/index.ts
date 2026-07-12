import express from 'express'

//Config
import { PORT } from './configs/env.js'
import cookieParser from 'cookie-parser'
import connectDb from './db/connectDb.js'

//Authorization
import authRouter from './routes/auth.route.js'
import authorizationMiddleware from './middlewares/authorizeUser.middleware.js'
import { authorizeAdmin } from './middlewares/authorizeAdmin.middleware.js'

const app = express()
await connectDb()

app.use(express.json())
app.use(cookieParser())

// Serve uploaded files
app.use('/uploads', express.static('uploads'))

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/profile', authorizationMiddleware, authorizeAdmin, (req, res) => {
	res.status(200).json({ message: 'Authorized' })
})
app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})

export default app
