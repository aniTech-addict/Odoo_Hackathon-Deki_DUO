import { Router } from 'express'
import {
	createMaintenanceLog,
	updateMaintenanceLog,
	deleteMaintenanceLog,
	getMaintenanceLog,
	getMaintenanceLogs,
} from '../controller/maintenance.controller.js'

const maintenanceRouter = Router()

maintenanceRouter.post('/', createMaintenanceLog)
maintenanceRouter.get('/', getMaintenanceLogs)
maintenanceRouter.get('/:id', getMaintenanceLog)
maintenanceRouter.put('/:id', updateMaintenanceLog)
maintenanceRouter.delete('/:id', deleteMaintenanceLog)

export default maintenanceRouter
