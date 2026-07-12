import prisma from '../db/prisma.js'
import bcrypt from 'bcrypt'
import { createMail, sendMail } from './sendMail.js'
async function sendOtp(otp: number, email: string) {
	const mailContent = new createMail('Otp verification', `Your Otp is`, `<h1> ${otp} </h1>`)
	await sendMail(email, mailContent)
}

async function generateOtp(email: string) {
	const otp = Math.floor(10031 + Math.random() * 87537)
	const newOtp = await prisma.otp.create({
		data: {
			otp: await bcrypt.hash(String(otp), 10),
			expireAt: new Date(Date.now() + 5 * 60 * 1000),
		},
	})
	await sendOtp(otp, email)
	return newOtp.id
}

async function verifyOtp(userId: string, otp: number) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { otp: true },
	})
	if (!user || !user.otp) {
		console.log('OTP not found')
		return false
	}
	if (!(await bcrypt.compare(String(otp), user.otp.otp))) {
		return false
	}
	return true
}

export { generateOtp, verifyOtp }
