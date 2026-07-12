import nodemailer from 'nodemailer'
import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from './env.js'

const hasSmtpConfig = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS)

const transporter = hasSmtpConfig
	? nodemailer.createTransport({
			host: SMTP_HOST,
			port: SMTP_PORT,
			secure: SMTP_PORT === 465,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS,
			},
		})
	: nodemailer.createTransport({ jsonTransport: true })

export default transporter
