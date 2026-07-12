import transporter from '../configs/nodeMailer.config.js'

export class createMail {
	subject
	text
	html

	constructor(subject, text, html) {
		this.subject = subject
		this.text = text
		this.html = html
	}
}

export const sendMail = async (receiverMail, mailContent) => {
	console.log(receiverMail)
	const info = await transporter.sendMail({
		from: '"Kirti Anand" <kirti7666anand15@gmail.com>',
		to: receiverMail,
		subject: mailContent.subject,
		text: mailContent.text,
		html: mailContent.html,
	})

	console.log('Message sent:', info.messageId)
	return info
}
