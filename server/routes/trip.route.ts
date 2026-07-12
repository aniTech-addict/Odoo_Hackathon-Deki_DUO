import { Router } from 'express'
import {
	registerTrip,
	updateTrip,
	deleteTrip,
	getTrip,
	getTrips,
} from '../controller/trip.controller.js'

const tripRouter = Router()

tripRouter.post('/', registerTrip)
tripRouter.get('/', getTrips)
tripRouter.get('/:id', getTrip)
tripRouter.put('/:id', updateTrip)
tripRouter.delete('/:id', deleteTrip)

export default tripRouter
