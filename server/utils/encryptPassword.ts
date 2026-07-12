import bcrypt from 'bcrypt'

export default async function encryptPassword(password) {
	const saltRounds = 10
	const hash = await bcrypt.hash(password, saltRounds)
	return hash
}
