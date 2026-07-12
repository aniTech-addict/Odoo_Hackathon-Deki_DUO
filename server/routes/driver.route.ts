import { Router } from 'express'
import {
	registerDriver,
	updateDriver,
	deleteDriver,
	getDriver,
	getDrivers,
} from '../controller/driver.controller.js'

const driverRouter = Router()

driverRouter.post('/', registerDriver)
driverRouter.get('/', getDrivers)
driverRouter.get('/:id', getDriver)
driverRouter.put('/:id', updateDriver)
driverRouter.delete('/:id', deleteDriver)

export default driverRouter
