import bcrypt from 'bcrypt'
import { createMail, sendMail } from './sendMail.js'

async function sendOtp(otp: number, email: string) {
	const subject = 'One-Time Password (OTP) Verification'
	const text = `Hello,\n\nYour One-Time Password (OTP) for verification is: ${otp}.\n\nPlease enter this code to complete your verification. Do not share this code with anyone.\n\nBest regards,\nThe AniTech Team`
	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
			<h2 style="color: #333333; text-align: center;">One-Time Password (OTP) Verification</h2>
			<p>Hello,</p>
			<p>Thank you for registering. Please use the following One-Time Password (OTP) to complete your verification process:</p>
			<div style="text-align: center; margin: 30px 0;">
				<span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #16a34a; background-color: #f9f9f9; padding: 10px 20px; border: 1px dashed #16a34a; border-radius: 4px; display: inline-block;">${otp}</span>
			</div>
			<p>This code is valid for 5 minutes. Please do not share this OTP with anyone.</p>
			<br />
			<p>Best regards,<br /><strong>The AniTech Team</strong></p>
		</div>
	`
	const mailContent = new createMail(subject, text, html)
	await sendMail(email, mailContent)
}

async function generateOtp(email: string) {
	const otp = Math.floor(10031 + Math.random() * 87537)
	const hashedOtp = await bcrypt.hash(String(otp), 10)
	await sendOtp(otp, email)
	return hashedOtp
}

async function verifyOtpValue(inputOtp: number, hashedOtp: string) {
	return await bcrypt.compare(String(inputOtp), hashedOtp)
}

export { generateOtp, verifyOtpValue }
