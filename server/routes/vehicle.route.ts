import { Router } from 'express'
import {
	registerVehicle,
	updateVehicle,
	deleteVehicle,
	getVehicle,
	getVehicles,
} from '../controller/vehicle.controller.js'

const vehicleRouter = Router()

vehicleRouter.post('/', registerVehicle)
vehicleRouter.get('/', getVehicles)
vehicleRouter.get('/:id', getVehicle)
vehicleRouter.put('/:id', updateVehicle)
vehicleRouter.delete('/:id', deleteVehicle)

export default vehicleRouter
