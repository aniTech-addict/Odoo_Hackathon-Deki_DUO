import { Router } from 'express'
import { sign_in, sign_out, sign_up, otp_verification } from '../controller/auth.controller.js'

const authRouter = Router()

authRouter.post('/sign_up', sign_up) //api/v1/auth

authRouter.post('/sign_in', sign_in)

authRouter.post('/sign_out', sign_out)

authRouter.post('/verify_otp', otp_verification)

export default authRouter
